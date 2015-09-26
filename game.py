# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

game_manager = Blueprint('game', __name__, url_prefix='/game')


@game_manager.route('/')
def render_game():
    return render_template('index.html')
