"use client";

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, User, Briefcase, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface StepWizardFormProps {
  step: number;
  selectedSector: string;
  selectedPendidikan: string;
  selectedGaji: string;
  filteredPendidikanOptions: string[];
  filteredGajiOptions: string[];
  onSectorChange: (value: string) => void;
  onPendidikanChange: (value: string) => void;
  onGajiChange: (value: string) => void;
  onNextStep: () => void;
  onReset: () => void;
  sektorOptions: string[];
}

const StepWizardForm: React.FC<StepWizardFormProps> = ({
  step,
  selectedSector,
  selectedPendidikan,
  selectedGaji,
  filteredPendidikanOptions,
  filteredGajiOptions,
  onSectorChange,
  onPendidikanChange,
  onGajiChange,
  onNextStep,
  onReset,
  sektorOptions
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStepConfig = () => {
    switch (step) {
      case 1:
        return {
          title: "Pilih Sektor Pekerjaan",
          subtitle: "Temukan peluang karier di sektor yang sesuai dengan minat Anda",
          icon: Briefcase,
          value: selectedSector,
          onChange: onSectorChange,
          options: sektorOptions,
          placeholder: "Pilih sektor pekerjaan...",
          image: "/image/main-feature.png"
        };
      case 2:
        return {
          title: "Lulusan Terakhir",
          subtitle: "Sesuaikan dengan latar belakang pendidikan Anda",
          icon: User,
          value: selectedPendidikan,
          onChange: onPendidikanChange,
          options: filteredPendidikanOptions,
          placeholder: "Pilih tingkat pendidikan...",
          image: "/image/main-feature.png"
        };
      case 3:
        return {
          title: "Rentang Gaji yang Diharapkan",
          subtitle: "Tentukan ekspektasi gaji sesuai dengan kebutuhan Anda",
          icon: DollarSign,
          value: selectedGaji,
          onChange: onGajiChange,
          options: filteredGajiOptions,
          placeholder: "Pilih rentang gaji...",
          image: "/image/main-feature.png"
        };
      default:
        return null;
    }
  };

  const config = getStepConfig();
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Input Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-md mx-auto w-full">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${step >= s 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`
                        w-12 h-1 mx-2 transition-all duration-300
                        ${step > s ? 'bg-gradient-to-r from-blue-500 to-blue-300' : 'bg-gray-200'}
                      `} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Title and Subtitle */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-300 rounded-2xl mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {config.title}
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                  {config.subtitle}
                </p>
              </div>

              {/* Input Field */}
              <div className="mb-8">
                <Select 
                  value={config.value} 
                  onValueChange={config.onChange}
                >
                  <SelectTrigger className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-base">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {step === 1 && (
                      <SelectItem value="all">Semua Sektor</SelectItem>
                    )}
                    {step === 2 && (
                      <SelectItem value="all">Semua Tingkat Pendidikan</SelectItem>
                    )}
                    {step === 3 && (
                      <SelectItem value="all">Semua Rentang Gaji</SelectItem>
                    )}
                    {config.options.map(option => (
                      <SelectItem 
                        key={option} 
                        value={option}
                        className="py-3 px-4 hover:bg-blue-50 transition-colors"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 text-gray-600 hover:text-gray-800"
                >
                  Ulangi
                </Button>
                <Button
                  onClick={onNextStep}
                  disabled={!config.value}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {step === 3 ? 'Lihat Hasil' : 'Lanjutkan'}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="text-sm text-gray-600 mb-2">
                  Langkah {step} dari 3
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-300 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Image
              src={config.image}
              alt="Feature illustration"
              fill
              className={`object-contain p-8 lg:p-16 transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadingComplete={() => setImageLoaded(true)}
              priority
            />
            <div className="absolute bottom-8 left-8 right-8 lg:bottom-12 lg:left-12 lg:right-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-1">
                  {step === 1 ? "Temukan Karier Impian" : step === 2 ? "Sesuaikan Profil Anda" : "Dapatkan Gaji Ideal"}
                </h3>
                <p className="text-sm text-gray-600">
                  {step === 1 
                    ? "Ratusan peluang menanti di berbagai sektor industri." 
                    : step === 2 
                    ? "Kami mencocokkan dengan peluang sesuai latar belakang Anda."
                    : "Wujudkan ekspektasi gaji Anda dengan pekerjaan yang tepat."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StepWizardForm;