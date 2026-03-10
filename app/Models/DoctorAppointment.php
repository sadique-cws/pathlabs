<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorAppointment extends Model
{
    /** @use HasFactory<\Database\Factories\DoctorAppointmentFactory> */
    use HasFactory;

    protected $fillable = [
        'appointment_code',
        'public_token',
        'lab_id',
        'doctor_id',
        'patient_name',
        'patient_phone',
        'patient_email',
        'patient_gender',
        'patient_age',
        'patient_address',
        'appointment_date',
        'slot_time',
        'appointment_at',
        'status',
        'consultation_fee',
        'payment_status',
        'payment_method',
        'payment_reference',
        'receipt_barcode',
        'cancelled_at',
        'cancel_reason',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'appointment_at' => 'datetime',
            'appointment_date' => 'date',
            'consultation_fee' => 'decimal:2',
            'cancelled_at' => 'datetime',
        ];
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
