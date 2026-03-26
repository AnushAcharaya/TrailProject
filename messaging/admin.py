from django.contrib import admin
from .models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'friendship', 'text', 'created_at', 'is_read']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


admin.site.register(Message, MessageAdmin)
