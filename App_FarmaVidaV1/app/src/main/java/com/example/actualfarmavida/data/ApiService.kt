package com.example.actualfarmavida.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.Call
import retrofit2.http.POST
interface ApiService {

    @POST("auth/login")
    fun loginUser(@Body loginRequest: LoginRequest): Call<LoginResponse>

    // Aquí puedes agregar más endpoints según necesites
}