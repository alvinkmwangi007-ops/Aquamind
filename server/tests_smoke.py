import json
from server.app import create_app


def run():
    app = create_app()
    client = app.test_client()

    # 1) Login as admin
    r = client.post('/api/users/login', json={'username': 'admin', 'password': 'adminpass'})
    print('login status', r.status_code)
    assert r.status_code == 200
    data = r.get_json()
    token = data.get('access_token')
    print('token present:', bool(token))

    # 2) Access protected without token -> should 401
    r2 = client.get('/api/logs/')
    print('/api/logs without token:', r2.status_code, r2.get_data(as_text=True))

    # 3) Access protected with token
    headers = {'Authorization': f'Bearer {token}'}
    r3 = client.get('/api/logs/', headers=headers)
    print('/api/logs with token:', r3.status_code, r3.get_data(as_text=True))

    # 4) Admin-only create course (should succeed for admin)
    r4 = client.post('/api/courses/', headers=headers, json={'name': 'Smoke Course', 'description': 'test'})
    print('create course (admin):', r4.status_code, r4.get_data(as_text=True))

    # 5) Login as regular user and try to create course -> should 403
    r5 = client.post('/api/users/login', json={'username': 'user', 'password': 'userpass'})
    user_token = r5.get_json().get('access_token')
    r6 = client.post('/api/courses/', headers={'Authorization': f'Bearer {user_token}'}, json={'name': 'Bad Course'})
    print('create course (non-admin):', r6.status_code, r6.get_data(as_text=True))

    # 6) Pagination metadata on users endpoint
    r7 = client.get('/api/users?per_page=1&page=1', headers=headers)
    print('/api/users pagination status:', r7.status_code, 'body:', r7.get_data(as_text=True))


if __name__ == '__main__':
    run()
