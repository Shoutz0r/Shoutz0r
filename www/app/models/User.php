<?php

namespace Shoutzor\Model;

use Phalcon\Mvc\Model;
use Phalcon\Validation;
use Phalcon\Validation\Validator\Email as EmailValidator;
use Phalcon\Validation\Validator\Uniqueness as UniquenessValidator;

class User extends Model
{

  public $id;
  public $username;
  public $email;
  public $role;
  public $verified;
  public $banned;
  public $created;

  public function validation()
  {
    $validator = new Validation();

    $validator->add(
      'email',
      new EmailValidator([
        'message' => 'Invalid email provided'
      ])
    );

    $validator->add(
      'email',
      new UniquenessValidator([
        'message' => 'This email is already in use'
      ])
    );

    $validator->add(
      'username',
      new UniquenessValidator([
        'message' => 'This username is already taken'
      ])
    );

    return $this->validate($validator);
  }
}
