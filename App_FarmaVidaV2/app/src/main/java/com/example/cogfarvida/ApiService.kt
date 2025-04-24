package com.example.cogfarvida

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    // Ruta para el endpoint de login
    @POST("auth/login")
    fun login(@Body loginRequest: LoginRequest): Call<LoginResponse>
}