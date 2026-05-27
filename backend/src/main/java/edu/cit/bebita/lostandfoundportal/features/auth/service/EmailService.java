package edu.cit.bebita.lostandfoundportal.features.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String to, String token, String firstName, String lastName, String studentId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify Your Lost & Found Portal Account");

            String verificationUrl = "https://lost-and-found-portal-pearl.vercel.app/verify-email?token=" + token;
            
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h2 style='color: #2563eb;'>Welcome to the Campus Lost & Found Portal!</h2>"
                + "<p>Hello <strong>" + firstName + " " + lastName + "</strong>,</p>"
                + "<p>Thank you for registering! We are excited to have you on board. Our system helps students report and recover lost items quickly and securely across the campus.</p>"
                + "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;'>"
                + "  <h3 style='margin-top: 0; color: #374151;'>Your Registered Credentials:</h3>"
                + "  <p style='margin: 5px 0;'><strong>Name:</strong> " + firstName + " " + lastName + "</p>"
                + "  <p style='margin: 5px 0;'><strong>Student ID:</strong> " + studentId + "</p>"
                + "  <p style='margin: 5px 0;'><strong>Email:</strong> " + to + "</p>"
                + "  <p style='margin: 5px 0;'><strong>Password:</strong> <em>(Hidden for security)</em></p>"
                + "</div>"
                + "<p>To complete your registration, please verify your email address by clicking the button below:</p>"
                + "<a href='" + verificationUrl + "' style='display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;'>Verify Email</a>"
                + "<p style='margin-top: 20px; font-size: 0.9em; color: #666;'>"
                + "If the button doesn't work, copy and paste this link into your browser:<br>"
                + verificationUrl
                + "</p>"
                + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset Your Lost & Found Portal Password");

            String resetUrl = "https://lost-and-found-portal-pearl.vercel.app/reset-password?token=" + token;
            
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h2 style='color: #2563eb;'>Password Reset Request</h2>"
                + "<p>Hello <strong>" + firstName + "</strong>,</p>"
                + "<p>We received a request to reset the password for your account. If you made this request, please click the button below to choose a new password. This link will expire in 1 hour.</p>"
                + "<a href='" + resetUrl + "' style='display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;'>Reset Password</a>"
                + "<p style='margin-top: 20px; font-size: 0.9em; color: #666;'>"
                + "If the button doesn't work, copy and paste this link into your browser:<br>"
                + resetUrl
                + "</p>"
                + "<p style='font-size: 0.9em; color: #666;'>If you didn't request this, you can safely ignore this email.</p>"
                + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    }
}
