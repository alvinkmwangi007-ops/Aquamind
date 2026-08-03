from __future__ import with_statement

import logging
from logging.config import fileConfig

from alembic import context
from flask import current_app

config = context.config
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic')

config.set_main_option('sqlalchemy.url', current_app.config.get('SQLALCHEMY_DATABASE_URI'))

import sys
sys.path.append('.')
from server.app import create_app
from server.extensions import db

app = create_app()

target_metadata = db.metadata

with app.app_context():
    def run_migrations_offline():
        url = current_app.config.get('SQLALCHEMY_DATABASE_URI')
        context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

        with context.begin_transaction():
            context.run_migrations()

    def run_migrations_online():
        connectable = db.engine

        with connectable.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)

            with context.begin_transaction():
                context.run_migrations()

    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()
