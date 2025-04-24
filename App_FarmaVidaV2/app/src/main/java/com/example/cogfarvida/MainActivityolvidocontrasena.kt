package com.example.cogfarvida

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivityolvidocontrasena : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nuevcontrasena) // Asegúrate que este layout exista
        // Referencia al TextView "Iniciar Sesión"
        val tvIniciarSesion = findViewById<TextView>(R.id.textViewIniciarSesion)

        // Evento para volver a la pantalla de inicio de sesión
        tvIniciarSesion.setOnClickListener {
            val intent = Intent(this, MainActivityInicio::class.java)
            startActivity(intent)
            finish()
        }
    }
}
