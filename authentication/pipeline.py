def save_google_user_info(backend, user, response, *args, **kwargs):
    if backend.name == 'google-oauth2':
        user.email = response.get('email')
        user.full_name = response.get('name')  # Google full name
        user.save()
