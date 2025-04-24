package com.example.cogfarvida

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetroCliente {
    // Asegúrate de usar la URL correcta de tu API
    private const val BASE_URL = "http://192.168.101.73:4000/api/4000"

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}