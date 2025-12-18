from pyramid.view import view_config
from pyramid.httpexceptions import HTTPBadRequest
import bcrypt
# Pastikan import model User sudah benar sesuai struktur folder Anda
from ..models import User 

# --- LOGIN ---
# Tambahkan view_config kedua untuk menangani route_name='login' juga
@view_config(route_name='login', renderer='json', request_method='POST')     # <--- TAMBAHAN
@view_config(route_name='api_login', renderer='json', request_method='POST')
def login(request):
    try:
        payload = request.json_body
        email = payload.get('email')
        password = payload.get('password')
    except Exception:
        return HTTPBadRequest(detail="Invalid JSON")

    # 1. Cari User
    user = request.dbsession.query(User).filter(User.email == email).first()

    # 2. Cek User & Password
    if user and password:
        # Encode password input ke bytes untuk bcrypt
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role
                }
            }

    # Jika gagal (User tidak ketemu atau Password salah)
    request.response.status = 401
    return {'error': 'Email atau Password salah'}

# --- REGISTER ---
@view_config(route_name='register', renderer='json', request_method='POST')      # <--- TAMBAHAN
@view_config(route_name='api_register', renderer='json', request_method='POST')
def register(request):
    try:
        payload = request.json_body
        name = payload.get('name')
        email = payload.get('email')
        password = payload.get('password')
        role = payload.get('role', 'student')
    except Exception:
        return HTTPBadRequest(detail="Invalid JSON")

    if not email or not password or not name:
        request.response.status = 400
        return {'error': 'Semua field wajib diisi'}

    existing_user = request.dbsession.query(User).filter(User.email == email).first()
    if existing_user:
        request.response.status = 400
        return {'error': 'Email sudah terdaftar'}

    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_password_string = hashed_bytes.decode('utf-8')

    new_user = User(
        name=name,
        email=email,
        password=hashed_password_string,
        role=role
    )
    
    request.dbsession.add(new_user)
    request.dbsession.flush()

    return {'success': True, 'message': 'Registrasi berhasil', 'user_id': new_user.id}