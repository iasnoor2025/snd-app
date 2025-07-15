@extends('errors::minimal')

@section('title', __('Core::errors.forbidden'))
@section('code', '403')
@section('message', __($exception->getMessage() ?: __('Core::errors.forbidden')))
