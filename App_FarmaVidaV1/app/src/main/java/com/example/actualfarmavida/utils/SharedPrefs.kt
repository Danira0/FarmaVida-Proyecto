package com.example.actualfarmavida.utils

import android.content.Context
import android.content.SharedPreferences

class SharedPrefs(context: Context) {

    private val sharedPreferences: SharedPreferences = context.getSharedPreferences(
        "FarmaVidaPrefs", Context.MODE_PRIVATE
    )

    fun saveAuthToken(token: String) {
        sharedPreferences.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    fun getAuthToken(): String? {
        return sharedPreferences.getString(KEY_AUTH_TOKEN, null)
    }

    fun saveUserId(id: Int) {
        sharedPreferences.edit().putInt(KEY_USER_ID, id).apply()
    }

    fun getUserId(): Int {
        return sharedPreferences.getInt(KEY_USER_ID, -1)
    }

    fun saveUserRole(role: Int) {
        sharedPreferences.edit().putInt(KEY_USER_ROLE, role).apply()
    }

    fun getUserRole(): Int {
        return sharedPreferences.getInt(KEY_USER_ROLE, -1)
    }

    fun saveUserName(name: String) {
        sharedPreferences.edit().putString(KEY_USER_NAME, name).apply()
    }

    fun getUserName(): String? {
        return sharedPreferences.getString(KEY_USER_NAME, null)
    }

    fun clear() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_USER_NAME = "user_name"
    }
}
