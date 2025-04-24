package com.example.actualfarmavida.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.actualfarmavida.databinding.ActivityDashboardBinding
import com.example.actualfarmavida.utils.SharedPrefs

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private lateinit var sharedPrefs: SharedPrefs

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sharedPrefs = SharedPrefs(this)

        // Verificar si hay un usuario logueado
        if (sharedPrefs.getAuthToken() == null) {
            navigateToLogin()
            return
        }

        setupToolbar()
        displayUserInfo()
        setupListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "FarmaVida Dashboard"
    }

    private fun displayUserInfo() {
        val userName = sharedPrefs.getUserName() ?: "Usuario"
        val roleId = sharedPrefs.getUserRole()
        val roleName = when (roleId) {
            1 -> "Administrador"
            2 -> "Empleado"
            else -> "Desconocido"
        }

        binding.tvWelcome.text = "Bienvenido a FarmaVida"
        binding.tvUserInfo.text = "Usuario: $userName"
        binding.tvRoleInfo.text = "Rol: $roleName"
    }

    private fun setupListeners() {
        binding.btnLogout.setOnClickListener {
            // Limpiar datos de sesión
            sharedPrefs.clear()
            navigateToLogin()
        }
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }
}
