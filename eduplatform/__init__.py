import os
import logging
from pyramid.config import Configurator
from pyramid.events import NewRequest

# Setup Logging biar kita tau siapa yang akses
log = logging.getLogger(__name__)

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        origin = request.headers.get('Origin')
        
        # Debugging: Print origin ke Log Render
        if origin:
            print(f"DEBUG CORS: Request from {origin}")
        
        # LOGIKA:
        # Kita izinkan Origin manapun yang meminta (Reflected Origin)
        # Ini cara standar untuk mengakali CORS dengan Credentials
        if origin:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
            })
        
        # Header Standar
        response.headers.update({
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
            
            # [PENTING] Set ke 0 agar browser TIDAK MENYIMPAN settingan lama yang salah
            # Nanti kalau sudah stabil, boleh diganti ke 3600
            'Access-Control-Max-Age': '0', 
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    if 'DATABASE_URL' in os.environ:
        settings['sqlalchemy.url'] = os.environ['DATABASE_URL']
        settings['sqlalchemy.pool_pre_ping'] = 'true'
        settings['sqlalchemy.pool_recycle'] = '300'

    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()