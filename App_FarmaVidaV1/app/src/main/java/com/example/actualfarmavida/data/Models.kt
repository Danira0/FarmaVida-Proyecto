package com.example.actualfarmavida.data

data class LoginRequest(
    val nombre_usuario: String,
    val contrasena_usuario: String,
    val requestedRole: Int
)

data class UserResponse(
    val id: Int,
    val nombre: String,
    val rol: String,
    val rolId: Int
)

data class LoginResponse(
    val status: Int,
    val message: String,
    val token: String?,
    val user: UserResponse?
)
