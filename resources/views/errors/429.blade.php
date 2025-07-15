@extends('errors::minimal')

@section('title', __('Core::errors.too_many_requests'))
@section('code', '429')
@section('message', __('Core::errors.too_many_requests'))
