import os
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))

# Menggunakan encoding='utf-8' untuk menghindari error di Windows
with open(os.path.join(here, 'README.md'), encoding='utf-8') as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt'), encoding='utf-8') as f:
    CHANGES = f.read()

requires = [
    'alembic',
    'plaster_pastedeploy',
    'pyramid >= 1.9',
    'pyramid_debugtoolbar',
    'pyramid_jinja2',
    'pyramid_retry',
    'pyramid_tm',
    'SQLAlchemy',
    'transaction',
    'zope.sqlalchemy',
    'waitress',
    'passlib',
    'bcrypt',
    'PyJWT',
    'psycopg2-binary', 
    'cloudinary',
]

tests_require = [
    'WebTest >= 1.3.1',
    'pytest>=3.7.4',
    'pytest-cov',
]

setup(
    name='eduplatform',
    version='0.0',
    description='EduPlatform',
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Pyramid',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
    ],
    author='',
    author_email='',
    url='',
    keywords='web pyramid pylons',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    extras_require={
        'testing': tests_require,
    },
    install_requires=requires,
    entry_points={
        'paste.app_factory': [
            'main = eduplatform:main',
        ],
        'console_scripts': [
            'initialize_eduplatform_db = eduplatform.scripts.initialize_db:main',
        ],
    },
)