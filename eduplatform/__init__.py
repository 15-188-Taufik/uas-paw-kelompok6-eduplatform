from pyramid.config import Configurator
from pyramid.events import NewRequest
import os

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        origin = request.headers.get('Origin')
        
        # LOGIKA: Apapun Origin-nya, kita izinkan (Echo)
        # Ini penting agar Vercel (yang domainnya gonta-ganti) tetap bisa masuk
        if origin:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
            })
        else:
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
            })

        response.headers.update({
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Credentials': 'true', # Wajib true agar cookie/login jalan
            'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    # Setup Database
    if 'DATABASE_URL' in os.environ:
        settings['sqlalchemy.url'] = os.environ['DATABASE_URL']
        # Fix SSL connection drop
        settings['sqlalchemy.pool_pre_ping'] = 'true'
        settings['sqlalchemy.pool_recycle'] = '300'

    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        
        # AKTIFKAN CORS
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()