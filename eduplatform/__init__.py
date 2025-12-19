import os
from pyramid.config import Configurator
from pyramid.events import NewRequest

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        # 1. Cek siapa yang mengirim request (Vercel / Localhost)
        origin = request.headers.get('Origin')
        
        # 2. JIKA ada Origin (request dari browser), pantulkan balik origin tersebut.
        # Ini adalah SYARAT WAJIB jika withCredentials=True
        if origin:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
            })
        else:
            # Fallback jika request dari server-ke-server (bukan browser)
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
            })

        # 3. Header wajib lainnya
        response.headers.update({
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Credentials': 'true', # Ini penyebab error sebelumnya jika Origin-nya '*'
            'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    # Setup Database URL dari Environment (Render)
    if 'DATABASE_URL' in os.environ:
        settings['sqlalchemy.url'] = os.environ['DATABASE_URL']
        # Setting pool agar koneksi database Neon tidak putus
        settings['sqlalchemy.pool_pre_ping'] = 'true'
        settings['sqlalchemy.pool_recycle'] = '300'

    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        
        # PENTING: Aktifkan CORS Listener yang baru kita buat
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()