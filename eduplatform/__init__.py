import os
from pyramid.config import Configurator
from pyramid.events import NewRequest

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        # 1. Ambil alamat si pengirim (misal: https://uas-paw-....vercel.app)
        origin = request.headers.get('Origin')
        
        # 2. LOGIKA PENTING:
        # Jika request punya Origin (dari browser), kita pantulkan balik (Echo).
        # Ini WAJIB jika frontend pakai withCredentials=True.
        # Bintang '*' DILARANG di sini.
        if origin:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
            })
        else:
            # Fallback (misal akses langsung dari Postman/Curl) baru boleh pakai bintang
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
            })

        # 3. Header standar lainnya
        response.headers.update({
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Credentials': 'true', # Ini yang bikin error kalau Origin-nya '*'
            'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    # Setup Database URL dari Environment Variable
    if 'DATABASE_URL' in os.environ:
        settings['sqlalchemy.url'] = os.environ['DATABASE_URL']
        # Setting tambahan untuk menjaga koneksi database tetap hidup
        settings['sqlalchemy.pool_pre_ping'] = 'true'
        settings['sqlalchemy.pool_recycle'] = '300'

    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        
        # PENTING: Daftarkan fungsi CORS di atas
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()