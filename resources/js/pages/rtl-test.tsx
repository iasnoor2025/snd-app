import { LanguageSwitcher } from '@/Core';

export default function RTLTest() {
    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold">RTL Test Page</h1>

            <div className="mb-8 rounded-md border p-4">
                <h2 className="mb-4 text-xl font-semibold">Language Switcher Component</h2>
                <LanguageSwitcher />
            </div>

            <div className="mb-8 rounded-md border p-4">
                <h2 className="mb-4 text-xl font-semibold">RTL Text Direction Test</h2>
                <p className="mb-2">This text should follow the current language direction.</p>
                <p className="mb-2 rtl:text-right">This text should be right-aligned in RTL mode.</p>
                <p className="mb-2 rtl:text-left">This text should be left-aligned in RTL mode.</p>
            </div>

            <div className="mb-8 rounded-md border p-4">
                <h2 className="mb-4 text-xl font-semibold">RTL Margin/Padding Test</h2>
                <div className="flex flex-col space-y-4">
                    <div className="ml-4 rounded bg-blue-100 p-2">This element has ml-4 and should have margin on the right in RTL mode</div>
                    <div className="mr-4 rounded bg-green-100 p-2">This element has mr-4 and should have margin on the left in RTL mode</div>
                    <div className="rounded bg-yellow-100 p-2 pl-4">This element has pl-4 and should have padding on the right in RTL mode</div>
                    <div className="rounded bg-red-100 p-2 pr-4">This element has pr-4 and should have padding on the left in RTL mode</div>
                </div>
            </div>

            <div className="mb-8 rounded-md border p-4">
                <h2 className="mb-4 text-xl font-semibold">RTL Flex Direction Test</h2>
                <div className="flex space-x-4 rtl:flex-row-reverse rtl:space-x-reverse">
                    <div className="rounded bg-purple-100 p-2">Item 1</div>
                    <div className="rounded bg-purple-200 p-2">Item 2</div>
                    <div className="rounded bg-purple-300 p-2">Item 3</div>
                </div>
            </div>

            <div className="mb-8 rounded-md border p-4">
                <h2 className="mb-4 text-xl font-semibold">RTL Border Test</h2>
                <div className="flex flex-col space-y-4">
                    <div className="border-l-4 border-blue-500 pl-2">This element has border-l-4 and should have border on the right in RTL mode</div>
                    <div className="border-r-4 border-green-500 pr-2">This element has border-r-4 and should have border on the left in RTL mode</div>
                </div>
            </div>
        </div>
    );
}
