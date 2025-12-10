from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized
import bcrypt
import json

# Sesuaikan dengan lokasi models kamu
from ..models import User

# --- REGISTER ---
@view_config(route_name='api_register', renderer='json', request_method='POST')
def register(request):
    try:
        # Ambil data dari React
        payload = request.json_body
        name = payload.get('name')
        email = payload.get('email')
        password = payload.get('password')
        role = payload.get('role', 'student') # Default student
    except Exception:
        return HTTPBadRequest(detail="Invalid JSON")

    # Validasi input
    if not email or not password or not name:
        request.response.status = 400
        return {'error': 'Semua field wajib diisi'}

    # Cek apakah email sudah ada
    existing_user = request.dbsession.query(User).filter(User.email == email).first()
    if existing_user:
        request.response.status = 400
        return {'error': 'Email sudah terdaftar'}

    # HASH PASSWORD (PENTING!)
    # Kita ubah password "rahasia123" menjadi string acak "$2b$12$..."
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_password_string = hashed_bytes.decode('utf-8')

    # Simpan ke Database
    new_user = User(
        name=name,
        email=email,
        password=hashed_password_string, # Simpan versi hash
        role=role
    )
    
    request.dbsession.add(new_user)
    # flush() agar id ter-generate dan error constraint terdeteksi segera
    request.dbsession.flush() 

    return {'success': True, 'message': 'Registrasi berhasil', 'user_id': new_user.id}

# --- LOGIN ---
@view_config(route_name='api_login', renderer='json', request_method='POST')
def login(request):
    try:
        payload = request.json_body
        email = payload.get('email')
        password = payload.get('password')
    except Exception:
        return HTTPBadRequest(detail="Invalid JSON")

    # 1. Cari User berdasarkan Email
    user = request.dbsession.query(User).filter(User.email == email).first()

    # 2. Jika user tidak ditemukan
    if not user:
        request.response.status = 401 # Unauthorized
        return {'error': 'Email atau Password salah'}

    # 3. Cek Password (Bandingkan input dengan Hash di DB)
    # Kita perlu encode ke bytes karena bcrypt bekerja dengan bytes
    stored_password_bytes = user.password.encode('utf-8')
    input_password_bytes = password.encode('utf-8')

    if bcrypt.checkpw(input_password_bytes, stored_password_bytes):
        # LOGIN SUKSES
        return {
            'success': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }
    else:
        # PASSWORD SALAH
        request.response.status = 401
        return {'error': 'Email atau Password salah'}