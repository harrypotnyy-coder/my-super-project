package com.example.probationbackend.repository

import com.example.probationbackend.model.Client
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ClientRepository : JpaRepository<Client, Long> {
    fun findByInn(inn: String): Optional<Client>
    fun findByUniqueId(uniqueId: String): Optional<Client> // Если будет поле uniqueId
    // Примеры дополнительных запросов
    // fun findByUnit(unit: String): List<Client>
    // fun findByFioContainingIgnoreCase(fio: String): List<Client>
}