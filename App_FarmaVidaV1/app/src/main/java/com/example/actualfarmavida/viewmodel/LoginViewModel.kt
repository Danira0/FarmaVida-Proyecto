package com.example.actualfarmavida.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.actualfarmavida.data.LoginRequest
import com.example.actualfarmavida.data.LoginResponse
import com.example.actualfarmavida.data.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class LoginViewModel : ViewModel() {

    private val _loginState = MutableStateFlow<Result<LoginResponse>?>(null)
    val loginState: StateFlow<Result<LoginResponse>?> = _loginState

    fun login(nombre: String, contrasena: String, rol: Int) {
        val request = LoginRequest(nombre, contrasena, rol)

        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.login(request)
                if (response.isSuccessful && response.body() != null) {
                    _loginState.value = Result.success(response.body()!!)
                } else {
                    _loginState.value = Result.failure(Exception("Error: ${response.code()}"))
                }
            } catch (e: IOException) {
                _loginState.value = Result.failure(Exception("Sin conexión al servidor"))
            } catch (e: HttpException) {
                _loginState.value = Result.failure(Exception("Error HTTP: ${e.code()}"))
            } catch (e: Exception) {
                _loginState.value = Result.failure(e)
            }
        }
    }
}
