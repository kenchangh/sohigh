# -*- coding: utf-8 -*-
import json

from flask import Blueprint, abort, request, jsonify
from redis_ import redis

state_manager = Blueprint('state', __name__, url_prefix='/state')


@state_manager.route('/<room_name>', methods=['GET', 'POST'])
def fetch_state(room_name):
    if not redis.sismember('states', room_name):
        abort(404)

    if request.method == 'GET':
        if redis.sismember('dirty_state', room_name):
            state = json.loads(redis.get('state:'+room_name))
            if not state:
                abort(404, 'Please submit initial state first with POST')

            redis.srem('dirty_state', room_name)
            state['dirty'] = True
            return jsonify(state)
        else:
            return jsonify({
                'dirty': False
            })

    if request.method == 'POST':
        new_state = request.form.get('newState')
        if not new_state:
            abort(400)

        try:
            json.loads(new_state)
        except ValueError:
            abort(400)

        redis.set('state:'+room_name, new_state)
        redis.sadd('dirty_state', room_name)
        return '', 200
