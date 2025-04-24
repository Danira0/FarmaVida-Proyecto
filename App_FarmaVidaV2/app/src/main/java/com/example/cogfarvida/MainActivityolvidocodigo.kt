package com.example.cogfarvida

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivityolvidocodigo : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_codigo)

        // Referencia al botón "Verificar Código"
        val botonVerificar = findViewById<Button>(R.id.buttonVerificarcodigo)

        // Evento para ir a la pantalla de recuperación de contraseña
        botonVerificar.setOnClickListener {
            val intent = Intent(this, MainActivityolvidocontrasena::class.java)
            startActivity(intent)
        }

        // Referencia al TextView "Volver atrás"
        val volverAtras = findViewById<TextView>(R.id.textView2)

        // Evento para volver a la pantalla de olvido de correo
        volverAtras.setOnClickListener {
            val intent = Intent(this, MainActivityolvidocorreo::class.java)
            startActivity(intent)
            finish()
        }
    }
}
