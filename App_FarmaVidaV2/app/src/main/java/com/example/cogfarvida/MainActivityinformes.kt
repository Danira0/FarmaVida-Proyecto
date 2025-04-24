package com.example.cogfarvida

import android.graphics.Color
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivityinformes : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_informes)

        // Configurar el spinner de PRODUCTOS
        val spinnerProductos = findViewById<Spinner>(R.id.spinnerProductos)
        val listaProductos = listOf(
            "Seleccione informe de productos",
            "Todos los Productos",
            "Productos por vencer",
            "Productos en Stock",
            "Productos por fecha de Ingreso"
        )
        val adapterProductos = ArrayAdapter(this, android.R.layout.simple_spinner_item, listaProductos)
        adapterProductos.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerProductos.adapter = adapterProductos

        // Configurar el spinner de MOVIMIENTOS
        val spinnerMovimientos = findViewById<Spinner>(R.id.spinnerMovimientos)
        val listaMovimientos = listOf(
            "Seleccione informe de movimientos",
            "Todos los Movimientos",
            "Movimiento por usuario",
            "Movimiento por fecha",
            "Movimiento por producto",
            "Movimiento por Tipo"
        )
        val adapterMovimientos = ArrayAdapter(this, android.R.layout.simple_spinner_item, listaMovimientos)
        adapterMovimientos.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerMovimientos.adapter = adapterMovimientos

        // Configurar el spinner de LABORATORIOS
        val spinnerLaboratorios = findViewById<Spinner>(R.id.spinnerLaboratorios)
        val listaLaboratorios = listOf(
            "Seleccione informe de laboratorios",
            "Todos los laboratorios",
            "Un solo laboratorio",
            "Producto por laboratorio"
        )
        val adapterLaboratorios = ArrayAdapter(this, android.R.layout.simple_spinner_item, listaLaboratorios)
        adapterLaboratorios.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerLaboratorios.adapter = adapterLaboratorios

        // Configurar el spinner de USUARIOS
        val spinnerUsuarios = findViewById<Spinner>(R.id.spinnerUsuarios)
        val listaUsuarios = listOf(
            "Seleccione informe de usuarios",
            "Por un usuario",
            "Usuario administrador",
            "Usuario empleado"
        )
        val adapterUsuarios = ArrayAdapter(this, android.R.layout.simple_spinner_item, listaUsuarios)
        adapterUsuarios.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerUsuarios.adapter = adapterUsuarios

        // Configurar el botón de descarga
        val btnDescargar = findViewById<Button>(R.id.buttonDescargarinforme)
        btnDescargar.setOnClickListener {
            // Aquí va la lógica para descargar el informe
            Toast.makeText(this, "Descargando informe...", Toast.LENGTH_SHORT).show()
        }
    }
}