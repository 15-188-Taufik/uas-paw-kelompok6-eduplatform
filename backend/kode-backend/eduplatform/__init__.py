from pyramid.config import Configurator
from pyramid.events import NewRequest

def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        response.headers.update({
        'Access-Control-Allow-Origin': '*', # Di production ganti dengan 'http://localhost:5173'
        'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2') # Opsional jika tidak dipakai lagi
        config.include('.models')
        config.include('.routes')
        
        # --- TAMBAHKAN LINE INI UNTUK CORS ---
        config.add_subscriber(add_cors_headers_response_callback, NewRequest)
        
        config.scan()
    return config.make_wsgi_app()