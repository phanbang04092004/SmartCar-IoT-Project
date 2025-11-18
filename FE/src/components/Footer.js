import React from 'react';

export default function Footer() {
    return (
        // Đổi sang màu đỏ sẫm
        <footer className="bg-red-800 text-white mt-12">
            <div className="container mx-auto px-4 py-8">
                {/* Icon Social (dùng màu trắng/xám nhạt) */}
                <div className="flex justify-center space-x-6 mb-4">
                    <a href="#!" className="text-red-200 hover:text-white">
                        <i className="fab fa-facebook-f fa-lg"></i>
                    </a>
                    <a href="#!" className="text-red-200 hover:text-white">
                        <i className="fab fa-twitter fa-lg"></i>
                    </a>
                    <a href="#!" className="text-red-200 hover:text-white">
                        <i className="fab fa-google fa-lg"></i>
                    </a>
                    <a href="#!" className="text-red-200 hover:text-white">
                        <i className="fab fa-instagram fa-lg"></i>
                    </a>
                    <a href="#!" className="text-red-200 hover:text-white">
                        <i className="fab fa-github fa-lg"></i>
                    </a>
                </div>
            </div>

            {/* Copyright (dùng màu đỏ đậm nhất) */}
            <div className="bg-red-900 text-red-200 text-center p-4 text-sm">
                © 2025 Copyright:
                <a className="text-white ml-1" href="https://mdbootstrap.com/">
                    Nhóm 16
                </a>
                (Bài tập lớn IoT)
            </div>
        </footer>
    );
}