# -*- coding: utf-8 -*-
"""
Stored Values:
invitation: hash {
    userId
    invitedUserId
}

invitations: set {
    invitedUserId
}

users: set {
    userId
}
"""
from flask import Blueprint, abort, request, jsonify
from redis_ import redis

room_manager = Blueprint('room', __name__, url_prefix='/room')


@room_manager.route('/create', methods=['POST'])
def create_room():
    user_id = request.form.get('userId')
    room_name = request.form.get('roomName')
    if (not user_id) or (not room_name):
        abort(400)

    redis.sadd('pending', room_name)
    redis.set('pending:'+room_name, user_id)

    return '', 200


@room_manager.route('/')
def all_rooms():
    room_names = list(redis.smembers('pending'))
    room_names = sorted(room_names)
    return jsonify({
        'data': room_names
    })


@room_manager.route('/join', methods=['POST'])
def join_room():
    room_name = request.form.get('roomName')
    user_id = request.form.get('userId')
    if (not room_name) or (not user_id):
        abort(400)

    redis.srem('pending', room_name)
    creator = redis.get('pending:'+room_name)
    redis.delete('pending:'+room_name)

    redis.sadd('states', room_name)
    redis.sadd('state:{}:users'.format(room_name), creator, user_id)

    return jsonify({
        'roomName': room_name,
        'creator': creator,
    })


@room_manager.route('/joined')
def check_if_request():
    """
    Requester reads the status, if joined yet.
    Render game if true
    """
    room_name = request.args.get('roomName')
    if not room_name:
        abort(400)

    pending_invitation = redis.sismember('pending', room_name)
    joined = not pending_invitation
    return jsonify({
        'joined': joined
    })
