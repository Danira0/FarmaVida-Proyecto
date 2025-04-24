package com.example.actualfarmavida.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.actualfarmavida.R
import com.example.actualfarmavida.databinding.ActivityLoginBinding
import com.example.actualfarmavida.ui.viewmodel.LoginViewModel
import com.example.actualfarmavida.ui.viewmodel.Result
import com.example.actualfarmavida.utils.SharedPrefs

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: LoginViewModel
    private lateinit var sharedPrefs: SharedPrefs

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[LoginViewModel::class.java]
        sharedPrefs = SharedPrefs(this)

        // Si ya hay un token guardado, ir directamente al Dashboard
        if (sharedPrefs.getAuthToken() != null) {
            navigateToDashboard()
            return
        }

        setupObservers()
        setupListeners()
    }

    private fun setupObservers() {
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.btnLogin.isEnabled = !isLoading
        }

        viewModel.loginResult.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    val response = result.data
                    if (response.status == 200 && response.token != null && response.user != null) {
                        // Guardar datos en SharedPreferences
                        sharedPrefs.saveAuthToken(response.token)
                        sharedPrefs.saveUserId(response.user.id)
                        sharedPrefs.saveUserRole(response.user.rolId)
                        sharedPrefs.saveUserName(response.user.nombre)

                        Toast.makeText(this, "Bienvenido ${response.user.nombre}", Toast.LENGTH_SHORT).show()
                        navigateToDashboard()
                    } else {
                        Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                    }
                }
                is Result.Failure -> {
                    val errorMessage = result.exception.message ?: "Error al iniciar sesión"
                    Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val username = binding.etUsername.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Por favor completa todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val roleId = when {
                binding.rbAdmin.isChecked -> 1 // Administrador
                binding.rbEmployee.isChecked -> 2 // Empleado
                else -> {
                    Toast.makeText(this, "Por favor selecciona un rol", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
            }

            viewModel.login(username, password, roleId)
        }
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        startActivity(intent)
        finish()
    }
}