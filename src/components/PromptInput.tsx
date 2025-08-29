import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="h-full flex flex-col">
      <label htmlFor="prompt" className="mb-2 font-semibold text-gray-300">الوصف التفصيلي أو السيناريو</label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="صف المشهد الذي تتخيله بالتفصيل، أو اكتب سيناريو قصيرًا، أو ضع عنوانًا للموضوع... كلما كان الوصف أغنى، كانت النتيجة أفضل. مثال: مشهد سينمائي واسع لمدينة مستقبلية عند الغسق، سيارات طائرة تتنقل بين ناطحات السحاب النيون..."
        className="w-full flex-grow bg-gray-900/70 border-2 border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-none min-h-[150px]"
        rows={5}
      />
    </div>
  );
};