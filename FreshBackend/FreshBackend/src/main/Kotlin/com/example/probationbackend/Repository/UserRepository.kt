package com.example.probationbackend.repository

import com.example.probationbackend.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByInn(inn: String): Optional<User>
    fun findByUniqueId(uniqueId: String): Optional<User> // Для поиска по uniqueId (для Traccar)
}