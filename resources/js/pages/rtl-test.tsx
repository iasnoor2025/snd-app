import React from 'react';
import { LanguageSwitcher } from "@/Core";

export default function RTLTest() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">RTL Test Page</h1>

            <div className="mb-8 p-4 border rounded-md">
                <h2 className="text-xl font-semibold mb-4">Language Switcher Component</h2>
                <LanguageSwitcher />
            </div>

            <div className="mb-8 p-4 border rounded-md">
                <h2 className="text-xl font-semibold mb-4">RTL Text Direction Test</h2>
                <p className="mb-2">This text should follow the current language direction.</p>
                <p className="mb-2 rtl:text-right">This text should be right-aligned in RTL mode.</p>
                <p className="mb-2 rtl:text-left">This text should be left-aligned in RTL mode.</p>
            </div>

            <div className="mb-8 p-4 border rounded-md">
                <h2 className="text-xl font-semibold mb-4">RTL Margin/Padding Test</h2>
                <div className="flex flex-col space-y-4">
                    <div className="ml-4 bg-blue-100 p-2 rounded">This element has ml-4 and should have margin on the right in RTL mode</div>
                    <div className="mr-4 bg-green-100 p-2 rounded">This element has mr-4 and should have margin on the left in RTL mode</div>
                    <div className="pl-4 bg-yellow-100 p-2 rounded">This element has pl-4 and should have padding on the right in RTL mode</div>
                    <div className="pr-4 bg-red-100 p-2 rounded">This element has pr-4 and should have padding on the left in RTL mode</div>
                </div>
            </div>

            <div className="mb-8 p-4 border rounded-md">
                <h2 className="text-xl font-semibold mb-4">RTL Flex Direction Test</h2>
                <div className="flex rtl:flex-row-reverse space-x-4 rtl:space-x-reverse">
                    <div className="bg-purple-100 p-2 rounded">Item 1</div>
                    <div className="bg-purple-200 p-2 rounded">Item 2</div>
                    <div className="bg-purple-300 p-2 rounded">Item 3</div>
                </div>
            </div>

            <div className="mb-8 p-4 border rounded-md">
                <h2 className="text-xl font-semibold mb-4">RTL Border Test</h2>
                <div className="flex flex-col space-y-4">
                    <div className="border-l-4 border-blue-500 pl-2">This element has border-l-4 and should have border on the right in RTL mode</div>
                    <div className="border-r-4 border-green-500 pr-2">This element has border-r-4 and should have border on the left in RTL mode</div>
                </div>
            </div>
        </div>
    );
}

