# -*- coding: utf-8 -*-
import json

import requests

from redis_ import redis

base_url = 'http://127.0.0.1:5000'
room_url = base_url + '/room'
state_url = base_url + '/state'
creator = 'creator'
invited = 'invited'

numbers = range(1, 11)
room_names = [unicode('room'+str(n)) for n in numbers]


def create_room(room_name):
    # first user create room
    payload = {
        'userId': creator,
        'roomName': room_name,
    }
    req = requests.post(room_url+'/create', data=payload)
    assert req.status_code == 200
    assert redis.sismember('pending', room_name)
    assert redis.get('pending:'+room_name) == creator


def someone_joined(room_name):
    params = {
        'roomName': room_name
    }
    req = requests.get(room_url+'/joined', params=params)
    assert req.status_code == 200

    data = req.json()
    assert data.get('joined') is not None
    return data['joined']


def join_room(room_name):
    payload = {
        'roomName': room_name,
        'userId': invited
    }
    req = requests.post(room_url+'/join', data=payload)
    assert req.status_code == 200
    assert not redis.sismember('pending', room_name)
    assert not redis.get('pending:'+room_name)

    data = req.json()
    assert data['roomName'] == room_name
    assert data['creator'] == creator
    assert redis.sismember('states', room_name)
    state_key = 'state:{}:users'.format(room_name)
    assert len(list(redis.smembers(state_key)))
    assert redis.sismember(state_key, creator)
    assert redis.sismember(state_key, invited)


def get_state(room_name):
    url = '{}/{}'.format(state_url, room_name)
    req = requests.get(url)
    assert req.status_code == 200

    state = req.json()
    return state


def update_state(room_name, new_state):
    url = '{}/{}'.format(state_url, room_name)
    payload = {
        'newState': json.dumps(new_state)
    }

    req = requests.post(url, data=payload)
    assert req.status_code == 200


def test_game_flow():
    for room_name in room_names:
        create_room(room_name)
        assert not someone_joined(room_name)

    # second user sees list of rooms
    req = requests.get(room_url+'/')
    assert req.status_code == 200
    assert req.json()['data'] == sorted(room_names)

    for room_name in room_names:
        join_room(room_name)
        assert someone_joined(room_name)

        new_state = {
            'width': 100,
        }
        update_state(room_name, new_state)
        state = get_state(room_name)
        assert state['dirty']
        assert state['width'] == new_state['width']

        # stale state
        # should be explicitly marked as not dirty
        # don't update values
        state = get_state(room_name) 
        assert not state['dirty']
        assert not state.get('width')

        new_state = {
            'width': 60,
        }
        update_state(room_name, new_state)
        state = get_state(room_name)
        assert state['dirty']
        assert state['width'] == new_state['width']

        state = get_state(room_name)  # stale state
        assert not state['dirty']
        assert not state.get('width')


def teardown_module():
    for room_name in room_names:
        redis.flushall()
