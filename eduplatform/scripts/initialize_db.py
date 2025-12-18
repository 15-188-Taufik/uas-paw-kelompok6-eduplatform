import argparse
import sys

from pyramid.paster import bootstrap, setup_logging
from sqlalchemy.exc import OperationalError

from .. import models
# Import Base agar kita bisa membuat tabel secara otomatis
from ..models.meta import Base 

def setup_models(dbsession):
    """
    Add or update models / fixtures in the database.
    """
    # BAGIAN INI SAYA KOSONGKAN (pass).
    # Kode sebelumnya error karena mencoba mengisi data ke tabel 'models' / 'MyModel'
    # yang kemungkinan tidak ada atau cuma contoh template.
    
    # Jika nanti Anda ingin membuat User Admin otomatis, tulis kodenya di sini.
    pass


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'config_uri',
        help='Configuration file, e.g., development.ini',
    )
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)

    try:
        with env['request'].tm:
            dbsession = env['request'].dbsession
            
            # --- TAMBAHAN BARU (PENTING) ---
            # Kita ambil engine database dan paksa buat semua tabel 
            # berdasarkan kodingan models Anda.
            engine = dbsession.bind
            Base.metadata.create_all(engine)
            # -------------------------------

            setup_models(dbsession)
            
            print("Sukses! Tabel database telah dibuat.")

    except OperationalError as e:
        print(f"Terjadi error operasional: {e}")
        print('''
Pyramid is having a problem using your SQL database.  The problem
might be caused by one of the following things:

1.  You may need to initialize your database tables with `alembic`.
    Check your README.txt for description and try to run it.

2.  Your database server may not be running.  Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.
            ''')