# -*- coding: utf-8 -*-
from flask import Flask

from users import room_manager
from state import state_manager
from game import game_manager


app = Flask(__name__)

app.register_blueprint(room_manager)
app.register_blueprint(state_manager)
app.register_blueprint(game_manager)


if __name__ == "__main__":
    app.run(debug=True)
