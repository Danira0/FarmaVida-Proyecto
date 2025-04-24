package com.example.cogfarvida

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivityolvidocorreo : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_olvido)

        // Referencia al TextView "Iniciar Sesión"
        val tvIniciarSesion = findViewById<TextView>(R.id.textViewIniciarSesion)

        // Referencia al botón "Enviar Código"
        val botonEnviarCodigo = findViewById<Button>(R.id.buttonEnviarCodigo)

        // Evento para volver a la pantalla de inicio de sesión
        tvIniciarSesion.setOnClickListener {
            val intent = Intent(this, MainActivityInicio::class.java)
            startActivity(intent)
            finish()
        }

        // Evento para ir a la pantalla del código
        botonEnviarCodigo.setOnClickListener {
            val intent = Intent(this, MainActivityolvidocodigo::class.java)
            startActivity(intent)
        }
    }
}
