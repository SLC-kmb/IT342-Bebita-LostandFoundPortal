package edu.cit.bebita.lostandfoundmobile.features.home

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import edu.cit.bebita.lostandfoundmobile.features.auth.LoginActivity
import edu.cit.bebita.lostandfoundmobile.features.dashboard.DashboardActivity
import edu.cit.bebita.lostandfoundmobile.shared.network.SessionManager

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val sessionManager = SessionManager(this)
        
        // Route to Dashboard if logged in, otherwise route to Login
        if (sessionManager.fetchAuthToken() != null) {
            startActivity(Intent(this, DashboardActivity::class.java))
        } else {
            startActivity(Intent(this, LoginActivity::class.java))
        }
        
        finish() // End MainActivity so the user can't navigate back to it
    }
}