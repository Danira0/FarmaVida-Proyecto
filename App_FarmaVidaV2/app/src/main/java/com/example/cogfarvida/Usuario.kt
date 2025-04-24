package com.example.cogfarvida

import com.google.gson.annotations.SerializedName

data class Usuario(
    @SerializedName("ID_Usuario")
    val idUsuario: Int = 0,

    @SerializedName("nombre")
    val nombreUsuario: String = "",

    @SerializedName("contrasena_usuario")
    val contrasenaUsuario: String = "",

    @SerializedName("correo_usuario")
    val correoUsuario: String = "",

    @SerializedName("rol")
    val rolUsuario: String = ""
)

// Clase para la solicitud de login - CORREGIDA para coincidir con el backend
data class LoginRequest(
    @SerializedName("username")  // Modificado para coincidir con el backend
    val nombreUsuario: String,

    @SerializedName("password")  // Modificado para coincidir con el backend
    val contrasenaUsuario: String
)

// Clase para la respuesta del servidor - CORREGIDA para coincidir con el backend
data class LoginResponse(
    @SerializedName("token")
    val token: String?,

    @SerializedName("user")  // Modificado para coincidir con la respuesta del backend
    val usuario: Usuario?,

    @SerializedName("message")  // Modificado para coincidir con la respuesta del backend
    val mensaje: String?,

    @SerializedName("status")  // Añadido para coincidir con la respuesta del backend
    val status: Int?
)