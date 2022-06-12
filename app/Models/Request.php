<?php

namespace App\Models;

use App\Traits\UsesUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use UsesUUID, HasFactory;

    const CREATED_AT = 'requested_at';
    const UPDATED_AT = 'played_at';

    public function media()
    {
        return $this->belongsTo('App\Models\Media');
    }

    public function requested_by()
    {
        return $this->hasOne('App\Models\User', 'id', 'requested_by');
    }

    public function votes()
    {
        return $this->belongsToMany('App\Models\User');
    }
}
