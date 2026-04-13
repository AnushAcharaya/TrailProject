import { FaCloudUploadAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const FileUpload = ({ onFileSelect }) => {
  const { t } = useTranslation('insurance');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-upload-area">
      <FaCloudUploadAlt className="upload-icon" />
      <div>
        <p className="text-lg font-bold text-gray-700 mb-1">{t('submitClaim.form.uploadInstructions')}</p>
        <p className="text-sm text-gray-500">{t('submitClaim.form.fileTypes')}</p>
      </div>
      <input
        type="file"
        className="hidden"
        id="file-upload"
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl transition-all"
      >
        {t('submitClaim.form.selectFiles')}
      </label>
    </div>
  );
};

export default FileUpload;
