<?php

namespace Modules\Settings\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array;
     */
    public function rules()
    {
        $id = $this->route('setting');

        return [
            'key' => ['sometimes', 'required', 'string', 'max:255', 'unique:settings,key,' . $id . ',id,group,' . $this->input('group')],
            'value' => ['sometimes', 'required'],
            'group' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'nullable', 'string', 'in:string,boolean,integer,float,array,json'],
            'options' => ['sometimes', 'nullable', 'array'],
            'display_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_system' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0']
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array;
     */
    public function messages()
    {
        return [
            'key.unique' => 'The setting key must be unique within its group.',
            'type.in' => 'The setting type must be one of: string, boolean, integer, float, array, json.',
        ];
    }
}

