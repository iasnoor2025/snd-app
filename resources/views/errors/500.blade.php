@extends('errors::minimal')

@section('title', __('Core::errors.server_error'))
@section('code', '500')
@section('message', __('Core::errors.server_error'))
