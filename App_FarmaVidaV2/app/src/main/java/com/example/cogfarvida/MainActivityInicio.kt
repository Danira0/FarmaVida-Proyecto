package com.example.cogfarvida

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivityInicio : AppCompatActivity() {
    private lateinit var editTextUsuario: EditText
    private lateinit var editTextPassword: EditText
    private lateinit var buttonIniciarSesion: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_inicio)

        // Inicializar vistas
        editTextUsuario = findViewById(R.id.editTextUsuario)
        editTextPassword = findViewById(R.id.editTextPassword)
        buttonIniciarSesion = findViewById(R.id.buttonIniciarSesion)

        // Configurar evento de clic para el botón de inicio de sesión
        buttonIniciarSesion.setOnClickListener {
            val nombreUsuario = editTextUsuario.text.toString().trim()
            val contrasena = editTextPassword.text.toString().trim()

            // Validar campos no vacíos
            if (nombreUsuario.isEmpty() || contrasena.isEmpty()) {
                Toast.makeText(this, "Por favor complete todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Realizar la autenticación
            realizarLogin(nombreUsuario, contrasena)
        }
    }

    private fun realizarLogin(nombreUsuario: String, contrasena: String) {
        val loginRequest = LoginRequest(nombreUsuario, contrasena)

        Log.d("LOGIN_DEBUG", "Intentando login con usuario: $nombreUsuario")

        RetroCliente.apiService.login(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                Log.d("LOGIN_DEBUG", "Código de respuesta: ${response.code()}")

                if (response.isSuccessful) {
                    val loginResponse = response.body()
                    Log.d("LOGIN_DEBUG", "Respuesta recibida: $loginResponse")

                    if (loginResponse?.usuario != null && loginResponse.token != null) {
                        // Guardar token en SharedPreferences
                        guardarSesion(loginResponse.token, loginResponse.usuario)

                        // Navegar a la pantalla de informes
                        val intent = Intent(this@MainActivityInicio, MainActivityinformes::class.java)
                        startActivity(intent)
                        finish() // Cierra esta actividad para que no se pueda volver atrás
                    } else {
                        Toast.makeText(this@MainActivityInicio,
                            loginResponse?.mensaje ?: "Error de autenticación",
                            Toast.LENGTH_SHORT).show()
                    }
                } else {
                    try {
                        val errorBody = response.errorBody()?.string()
                        Log.e("LOGIN_DEBUG", "Error body: $errorBody")
                        Toast.makeText(this@MainActivityInicio,
                            "Error: ${response.code()} - $errorBody", Toast.LENGTH_SHORT).show()
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivityInicio,
                            "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Log.e("LOGIN_DEBUG", "Error de conexión", t)
                Toast.makeText(this@MainActivityInicio,
                    "Error de conexión: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun guardarSesion(token: String, usuario: Usuario) {
        // Guardar información de sesión usando SharedPreferences
        val sharedPreferences = getSharedPreferences("MiApp", MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString("TOKEN", token)
        editor.putString("NOMBRE_USUARIO", usuario.nombreUsuario)
        editor.putString("ROL_USUARIO", usuario.rolUsuario)
        editor.putInt("ID_USUARIO", usuario.idUsuario)
        editor.apply()
    }
}