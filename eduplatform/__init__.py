import os
from pyramid.config import Configurator
from pyramid.events import NewRequest

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        # 1. Ambil alamat si pengirim (misal: https://eduplatform.web.id)
        origin = request.headers.get('Origin')
        
        # 2. Logika Dinamis:
        # Jika ada Origin (request dari browser), kita izinkan Origin tersebut secara spesifik.
        # Ini wajib agar 'Access-Control-Allow-Credentials': 'true' bisa jalan.
        if origin:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
            })
        else:
            # Fallback untuk tools seperti Postman yang tidak kirim Origin
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
            })

        # 3. Header Standar Lainnya
        response.headers.update({
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Credentials': 'true',  # <--- INI PENTING SEKALI
            'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):

    # Setup Database URL dari Environment Variable (untuk Render/Neon)
    if 'DATABASE_URL' in os.environ:
        settings['sqlalchemy.url'] = os.environ['DATABASE_URL']

    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2') 
        config.include('.models')
        config.include('.routes')
        
        # Daftarkan Subscriber CORS yang baru
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()