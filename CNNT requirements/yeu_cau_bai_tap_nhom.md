# Yêu cầu bài tập lớn nhóm – CNNT

## Hồ sơ nộp chung cho mọi đề

- Báo cáo 12–18 trang nội dung chính, gồm yêu cầu, giả định, kiến trúc, triển khai, kiểm thử, đánh giá và tài liệu tham khảo; phụ lục cấu hình không tính vào giới hạn trang.
- Sơ đồ hệ thống, bảng tài nguyên/IP/quyền phù hợp đề tài; file .pkt, cấu hình, script hoặc mã nguồn cần thiết; README ghi phiên bản, cách dựng lại và cách chạy kiểm thử.
- Bảng kiểm thử ghi đầu vào, thao tác, kết quả mong đợi, thực tế, đạt/chưa đạt và bằng chứng có dấu thời gian. Nộp dữ liệu đo gốc nếu đề có đánh giá hiệu năng.
- Video demo 5–7 phút; phiếu đóng góp cá nhân ghi nhiệm vụ, file tạo ra, bằng chứng và lỗi đã xử lý. Mỗi thành viên phải có sản phẩm kỹ thuật riêng.

## Quy tắc triển khai

Chỉ sử dụng dữ liệu giả và môi trường được phép. Không bắt buộc mua thiết bị, thuê Cloud hay triển khai ứng dụng nghiệp vụ hoàn chỉnh. Nêu nguồn mã/cấu hình tham khảo và cách sử dụng AI; sinh viên chịu trách nhiệm giải thích, chỉnh sửa và chạy lại phần đã nộp.

Packet Tracer chứng minh cấu hình và kết nối trong mô hình; không dùng kết quả đó để khẳng định thông lượng thực tế, độ phủ Wi-Fi hoặc khả năng chịu tải hệ thống thật.

## Tiến độ và đánh giá

### Các mốc thực hiện

### Rubric đề xuất cần giảng viên chốt

Tỷ lệ bên dưới áp dụng bên trong điểm bài thi, khác với tỷ trọng cuối kỳ 50% của học phần. Chưa coi rubric là quy định đã phê duyệt.

| Tiêu chí | Điểm tối đa |
|---|---|
| Nhóm — yêu cầu, giả định và lựa chọn giải pháp | 10 |
| Nhóm — thiết kế kiến trúc và tính toán có căn cứ | 10 |
| Nhóm — mô hình triển khai, giải thích các thông số | 10 |
| Nhóm — kiểm thử, số liệu và đánh giá giới hạn | 10 |
| Nhóm — báo cáo, cấu hình và hồ sơ minh chứng | 10 |
| Cá nhân — hoàn thành phần kỹ thuật có bằng chứng | 15 |
| Cá nhân — giải thích và thao tác trực tiếp | 15 |
| Cá nhân — vấn đáp về kiến trúc và tình huống thay đổi | 20 |

Điểm bài thi thang 10 = (điểm nhóm + điểm cá nhân) / 10. Phần đóng góp vào điểm học phần = điểm bài thi × 0,5. Chỉ thực hiện quy đổi này khi rubric trên được giảng viên chốt.

## Bảo vệ và phân công

Mỗi sinh viên trình bày phần việc, mở minh chứng và thực hiện một thao tác hoặc xử lý một thay đổi nhỏ. Giảng viên có thể hỏi cả kiến trúc chung. Câu hỏi trên phiếu là câu hỏi chuẩn bị, không phải toàn bộ câu hỏi bảo vệ.

Các vai trò SV1–SV4 là khung phân công; nhóm điền họ tên và mã sinh viên vào README.

Mọi thành viên cùng tham gia kiểm thử, không giao ai chỉ làm slide hoặc báo cáo.

Lịch bảo vệ thông báo riêng. Mức nâng cao trên từng phiếu là lựa chọn sau khi hoàn thành yêu cầu bắt buộc, không thay thế minh chứng lõi và không tự động được cộng điểm.

Bài tập của nhóm sẽ nộp lên file driver mà giảng viên cung cấp.

---

# Phiếu giao đề 05

## Phân tích và triển khai hệ thống Website cho trường học

Lớp: .................. Nhóm: .................. Hạn nộp: ..................

### 1. Bài toán và phạm vi

Website trường học cung cấp thông báo và tài liệu; không yêu cầu lập trình cổng thông tin hoàn chỉnh.

### 2. Yêu cầu bắt buộc

1. Vẽ đường đi yêu cầu từ trình duyệt qua DNS, IP, cổng dịch vụ đến HTTP server và hệ thống tập tin.
2. Triển khai Web trên Linux hoặc Windows; cấu hình tên miền nội bộ, thư mục nội dung và quyền của tiến trình dịch vụ.
3. Quan sát mã trạng thái HTTP, log truy cập, PID và CPU/RAM khi có nhiều yêu cầu; giải thích vai trò hệ điều hành.
4. Cấu hình giới hạn truy cập quản trị, sao lưu nội dung và demo phục hồi; trình bày phương án HTTPS cho triển khai thực tế.

### 3. Kiểm thử nghiệm thu tối thiểu

- **KT1.** Truy cập trang và tải tài liệu bằng tên miền từ máy khách.
- **KT2.** Đổi sai DNS rồi dừng dịch vụ; phân biệt bằng chứng của hai lỗi.
- **KT3.** Khôi phục nội dung từ bản sao và xác nhận trang truy cập lại được.

### 4. Phân công và minh chứng cá nhân

- **SV1:** Thiết kế luồng truy cập và DNS. Nộp file hoặc số liệu kèm giải thích phần thực hiện.
- **SV2:** Cài Web, cấu hình hệ điều hành. Nộp file hoặc số liệu kèm giải thích phần thực hiện.
- **SV3:** Thiết lập quyền, log và sao lưu. Nộp file hoặc số liệu kèm giải thích phần thực hiện.
- **SV4:** Đo tài nguyên và chẩn đoán lỗi. Nộp file hoặc số liệu kèm giải thích phần thực hiện.

### 5. Sản phẩm và bảo vệ

Nộp hồ sơ chung ở đầu tài liệu, kèm toàn bộ cấu hình/mô hình và bằng chứng KT1–KT3 của phiếu này. Nhóm 5 người áp dụng phần việc SV5 trong hướng dẫn chung.

**Câu hỏi chuẩn bị:** Ping thành công nhưng Website không mở được thì kiểm tra gì tiếp?

**Mở rộng tự chọn:** triển khai và kiểm thử một phương án thay thế cho một thành phần của đề; so sánh bằng cùng tiêu chí và số liệu.
