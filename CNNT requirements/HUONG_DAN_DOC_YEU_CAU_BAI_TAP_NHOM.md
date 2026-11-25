# Hướng dẫn đọc hiểu và làm bài tập nhóm CNNT – Đề tài 05

Bài này "dịch" hai văn bản của thầy ([yeu_cau_bai_tap_nhom.md](yeu_cau_bai_tap_nhom.md) và [mau_bao_cao_ca_nhan.md](mau_bao_cao_ca_nhan.md)) sang lời dễ hiểu: **phải nộp gì, từng chữ trong đề nghĩa là gì, làm bằng lệnh nào, chụp bằng chứng gì, và thầy chấm ra sao**.

Không cần đọc một lần hết. Lần đầu đọc mục 1 và 2 để thấy bức tranh tổng. Khi bắt tay làm phần nào thì mở mục tương ứng.

---

## Mục lục

1. [Bức tranh tổng: bài tập này là gì?](#1-bức-tranh-tổng-bài-tập-này-là-gì)
2. [Phải nộp những gì?](#2-phải-nộp-những-gì)
3. [Thầy chấm điểm thế nào?](#3-thầy-chấm-điểm-thế-nào)
4. [Từ điển: các chữ khó trong yêu cầu chung](#4-từ-điển-các-chữ-khó-trong-yêu-cầu-chung)
5. [Kiến thức nền cho Đề tài 05](#5-kiến-thức-nền-cho-đề-tài-05)
6. [Yêu cầu bắt buộc 1–4: hiểu và làm từng bước](#6-yêu-cầu-bắt-buộc-14-hiểu-và-làm-từng-bước)
7. [Kiểm thử KT1–KT3: làm và chụp bằng chứng](#7-kiểm-thử-kt1kt3-làm-và-chụp-bằng-chứng)
8. [Phân công SV1–SV4: ai làm gì](#8-phân-công-sv1sv4-ai-làm-gì)
9. [Câu hỏi chuẩn bị: ping được mà web không mở](#9-câu-hỏi-chuẩn-bị-ping-được-mà-web-không-mở)
10. [Phần mở rộng tự chọn và chỗ của Kubernetes](#10-phần-mở-rộng-tự-chọn-và-chỗ-của-kubernetes)
11. [Báo cáo cá nhân: điền từng mục thế nào](#11-báo-cáo-cá-nhân-điền-từng-mục-thế-nào)
12. [Buổi bảo vệ: chuẩn bị gì](#12-buổi-bảo-vệ-chuẩn-bị-gì)
13. [Cấu trúc thư mục nộp bài gợi ý](#13-cấu-trúc-thư-mục-nộp-bài-gợi-ý)
14. [Checklist cuối cùng trước khi nộp](#14-checklist-cuối-cùng-trước-khi-nộp)
15. [Những lỗi hay gặp làm mất điểm](#15-những-lỗi-hay-gặp-làm-mất-điểm)

---

## 1. Bức tranh tổng: bài tập này là gì?

Hãy tưởng tượng trường học thuê nhóm bạn **dựng một website thông báo và tài liệu**, rồi **vận hành nó cho an toàn**. Thầy không chấm website đẹp hay nhiều chức năng. Đề ghi rõ: *"không yêu cầu lập trình cổng thông tin hoàn chỉnh"*.

Thứ thầy chấm là **phần hạ tầng bên dưới website**, đúng tên môn Mạng máy tính và Hệ điều hành:

| Thầy muốn thấy bạn hiểu | Ví dụ đời thường |
|---|---|
| Một yêu cầu đi từ trình duyệt đến file trên ổ cứng như thế nào | Một lá thư đi từ người gửi, qua bưu điện, đến đúng ngăn tủ |
| Cài và cấu hình máy chủ web, phân quyền | Xây quầy tiếp dân, quy định ai được vào phòng nào |
| Quan sát máy chủ khi đông khách | Đứng nhìn hàng người xếp hàng và mức độ bận của nhân viên |
| Bảo vệ, sao lưu, phục hồi | Khoá phòng quản trị, photo hồ sơ cất riêng, mất thì lấy bản photo ra |
| Phân biệt và xử lý sự cố | Thư không đến: sai địa chỉ (DNS) hay bưu điện đóng cửa (dịch vụ dừng)? |

**Ba nguyên tắc xuyên suốt cả bài:**

1. **Có làm thật, có bằng chứng thật.** Mọi thứ ghi trong báo cáo phải có ảnh chụp, file cấu hình hoặc số liệu đo đi kèm. Không được bịa số liệu.
2. **Mỗi người có phần kỹ thuật riêng.** Không ai được chỉ làm slide hay báo cáo.
3. **Ai làm phần nào thì phải tự giải thích và thao tác lại được phần đó** trước mặt thầy.

---

## 2. Phải nộp những gì?

Có **hai loại hồ sơ**: hồ sơ **chung của nhóm** và báo cáo **riêng của từng người**.

### 2.1. Hồ sơ chung của nhóm

| # | Sản phẩm | Nghĩa là gì | Ghi chú |
|---|---|---|---|
| 1 | **Báo cáo nhóm 12–18 trang** | Tài liệu chính, đủ 7 phần: yêu cầu, giả định, kiến trúc, triển khai, kiểm thử, đánh giá, tài liệu tham khảo | Phụ lục (file cấu hình dài) **không** tính vào 18 trang |
| 2 | **Sơ đồ hệ thống** | Hình vẽ các máy, dịch vụ và đường đi của yêu cầu | Vẽ bằng draw.io, Visio… |
| 3 | **Bảng tài nguyên / IP / quyền** | Bảng liệt kê máy nào, IP gì, cổng gì, chạy bằng user nào, thư mục nào quyền gì | Xem mẫu ở mục 4.2 |
| 4 | **File cấu hình, script, mã nguồn** | Mọi file bạn đã viết hoặc sửa: `nginx.conf`, script backup, crontab… | File `.pkt` chỉ cần khi đề dùng Packet Tracer; Đề 05 không bắt buộc |
| 5 | **README** | File hướng dẫn: dùng phiên bản phần mềm gì, cách dựng lại từ đầu, cách chạy kiểm thử | Người lạ đọc README phải dựng lại được hệ thống |
| 6 | **Bảng kiểm thử** | Mỗi ca kiểm thử có: đầu vào, thao tác, kết quả mong đợi, kết quả thực tế, đạt/chưa đạt, bằng chứng **có dấu thời gian** | Xem mục 7 |
| 7 | **Dữ liệu đo gốc** | File kết quả đo nguyên bản (vd output của `ab`, file log), không chỉ con số đã chép vào báo cáo | Bắt buộc vì Đề 05 có đo CPU/RAM khi nhiều yêu cầu |
| 8 | **Video demo 5–7 phút** | Quay màn hình chạy hệ thống và các ca kiểm thử | Quá ngắn thì thiếu, quá dài thì thầy không xem hết |

### 2.2. Hồ sơ riêng từng người

| # | Sản phẩm | Nghĩa là gì |
|---|---|---|
| 1 | **Báo cáo cá nhân** (theo [mẫu](mau_bao_cao_ca_nhan.md)) | Kể phần **chính mình** làm, kèm minh chứng. Không chép nguyên báo cáo nhóm |
| 2 | **Phiếu đóng góp** | Ghi nhiệm vụ, file đã tạo, bằng chứng, lỗi đã xử lý. Mẫu báo cáo cá nhân đã bao gồm các ý này |
| 3 | **Sản phẩm kỹ thuật riêng** | Ít nhất một thứ kỹ thuật do chính mình làm: file cấu hình, script, bảng số liệu đo… |

### 2.3. Nộp ở đâu, khi nào?

- Nộp lên **thư mục Google Drive** thầy cung cấp.
- Hạn nộp và lịch bảo vệ thầy thông báo riêng. Mục "Các mốc thực hiện" trong văn bản hiện chưa có nội dung, nên nhóm cần hỏi lại thầy.

---

## 3. Thầy chấm điểm thế nào?

### 3.1. Bảng điểm (rubric)

Tổng 100 điểm, chia **50 điểm nhóm** và **50 điểm cá nhân**:

| Tiêu chí | Điểm | Thầy thực sự hỏi gì | Lấy điểm bằng cách |
|---|---|---|---|
| Nhóm: yêu cầu, giả định, lựa chọn giải pháp | 10 | "Các em hiểu đề chưa? Vì sao chọn Nginx mà không phải Apache?" | Ghi rõ giả định (vd: mạng LAN 192.168.1.0/24), so sánh và giải thích lựa chọn |
| Nhóm: thiết kế kiến trúc, tính toán có căn cứ | 10 | "Sơ đồ có đúng không? Số liệu lấy từ đâu?" | Sơ đồ rõ, mỗi con số (RAM, số kết nối) có căn cứ |
| Nhóm: mô hình triển khai, giải thích thông số | 10 | "Dòng `worker_processes auto` nghĩa là gì?" | Mỗi thông số quan trọng trong file cấu hình đều có giải thích |
| Nhóm: kiểm thử, số liệu, đánh giá giới hạn | 10 | "Đo được gì? Hệ thống chịu được bao nhiêu? Chỗ nào còn yếu?" | Bảng kiểm thử đầy đủ, có số đo thật, **nói thẳng hạn chế** |
| Nhóm: báo cáo, cấu hình, hồ sơ minh chứng | 10 | "Hồ sơ có đủ và gọn không?" | Đủ mục 2.1, thư mục nộp gọn gàng |
| Cá nhân: hoàn thành phần kỹ thuật có bằng chứng | 15 | "Em đã làm gì? Bằng chứng đâu?" | Báo cáo cá nhân kèm minh chứng cụ thể |
| Cá nhân: giải thích và thao tác trực tiếp | 15 | "Em mở cấu hình ra, sửa thử cái này xem." | Thao tác lại được ngay trên máy |
| Cá nhân: vấn đáp kiến trúc và tình huống thay đổi | **20** | "Nếu đổi cổng / đổi tên miền / có người tấn công thì sao?" | Hiểu nguyên lý, không học vẹt |

**Nhận xét quan trọng:** phần **vấn đáp chiếm 20 điểm**, nhiều nhất trong một tiêu chí. Làm hệ thống chạy được mới là một nửa, **hiểu tại sao nó chạy** mới quyết định điểm.

### 3.2. Cách quy đổi

```text
Điểm bài thi (thang 10) = (điểm nhóm + điểm cá nhân) / 10
Phần góp vào điểm học phần = điểm bài thi × 0,5
```

Ví dụ: nhóm được 42/50, bạn được 40/50 phần cá nhân → điểm bài thi = (42 + 40) / 10 = **8,2** → góp **4,1** điểm vào điểm học phần.

Rubric hiện mới là **đề xuất**, thầy có thể chỉnh trước khi chốt.

### 3.3. Hai thành viên cùng nhóm có thể khác điểm

Vì 50% là điểm cá nhân, bạn làm nhiều, có bằng chứng và trả lời tốt thì điểm cao hơn bạn cùng nhóm làm ít.

---

## 4. Từ điển: các chữ khó trong yêu cầu chung

### 4.1. Bảy phần của báo cáo nhóm

| Phần | Nghĩa | Đề 05 viết gì |
|---|---|---|
| **Yêu cầu** | Đề bắt làm gì | Chép lại 4 yêu cầu bắt buộc + KT1–KT3, diễn giải bằng lời của nhóm |
| **Giả định** | Những điều nhóm *tự quy ước* vì đề không nói | "Trường có mạng LAN 192.168.1.0/24", "máy chủ Ubuntu 22.04, 2 CPU, 2GB RAM", "khoảng 500 người truy cập cùng lúc giờ cao điểm" |
| **Kiến trúc** | Hệ thống gồm những thành phần nào, nối với nhau ra sao | Sơ đồ máy khách → DNS → máy chủ Nginx → thư mục web |
| **Triển khai** | Đã cài, cấu hình cụ thể thế nào | Các bước cài Nginx, file cấu hình, phân quyền, backup |
| **Kiểm thử** | Đã thử những gì, kết quả ra sao | Bảng KT1–KT3 + các ca đo tài nguyên |
| **Đánh giá** | Hệ thống tốt ở đâu, yếu ở đâu, giới hạn tới mức nào | "Chịu được ~X yêu cầu/giây; chưa có HTTPS thật; một máy nên còn điểm lỗi đơn" |
| **Tài liệu tham khảo** | Nguồn đã dùng | Tài liệu Nginx, Ubuntu, bài giảng, công cụ AI |

**Giả định** là phần nhiều nhóm hay quên. Đề chỉ nói "website trường học", nên nhóm phải tự đặt ra quy mô, mạng, phần cứng. Ghi giả định rõ ràng thì các con số phía sau mới có căn cứ.

### 4.2. Bảng tài nguyên / IP / quyền

Ví dụ mẫu cho Đề 05:

| Thành phần | Máy / IP | Cổng | Chạy bằng user | Thư mục | Quyền |
|---|---|---|---|---|---|
| Máy chủ web | Ubuntu, `192.168.1.10` | 80, (443) | master `root`, worker `www-data` | `/var/www/truong` | thư mục `755`, file `644` |
| Trang quản trị | cùng máy | 80 | `www-data` | `/var/www/truong/admin` | chỉ IP `192.168.1.0/24` + mật khẩu |
| Log | cùng máy | – | `www-data` ghi | `/var/log/nginx` | `640`, nhóm `adm` |
| Bản sao lưu | cùng máy (hoặc máy khác) | – | `root` | `/backup` | `700` |
| Máy khách | Windows, `192.168.1.20` | – | – | file `hosts` | – |

### 4.3. Các chữ khác

| Chữ trong đề | Nghĩa |
|---|---|
| **README ghi phiên bản** | Ghi rõ "Ubuntu 22.04, Nginx 1.18.0…". Phiên bản khác nhau thì cấu hình có thể khác nhau |
| **Cách dựng lại** | Các bước để người khác làm lại từ máy trắng ra hệ thống giống hệt |
| **Bằng chứng có dấu thời gian** | Ảnh chụp phải thấy được **ngày giờ** (đồng hồ hệ thống, hoặc chạy lệnh `date` ngay trước lệnh kiểm thử). Chứng minh bạn làm thật, vào lúc đó |
| **Dữ liệu đo gốc** | File output nguyên bản của công cụ đo. Ví dụ `ab ... > ket_qua_ab.txt`, nộp file `.txt` đó |
| **Dữ liệu giả** | Không dùng tên, số điện thoại, mật khẩu thật của ai. Tài khoản demo kiểu `sv01 / Demo@123` |
| **Môi trường được phép** | Máy ảo, máy cá nhân, phòng lab. Không thử tấn công hay quét máy của người khác |
| **Không bắt buộc thuê Cloud** | Máy ảo VirtualBox trên laptop là đủ điểm |
| **Nêu cách sử dụng AI** | Phải khai báo đã dùng AI vào việc gì. Dùng AI không bị cấm, nhưng **bạn phải giải thích và chạy lại được** phần đã nộp |
| **Packet Tracer** | Phần mềm mô phỏng mạng của Cisco. Kết quả mô phỏng chỉ chứng minh cấu hình đúng, **không** dùng để khẳng định tốc độ hay sức chịu tải thật |
| **Mức nâng cao không tự động được cộng điểm** | Làm thêm (vd Kubernetes) chỉ có giá trị khi phần bắt buộc đã đủ, và phải có bằng chứng, số liệu so sánh |

---

## 5. Kiến thức nền cho Đề tài 05

Đọc phần này trước khi làm mục 6. Đây cũng là những thứ hay bị hỏi khi vấn đáp.

### 5.1. Một yêu cầu web đi qua những đâu?

Khi gõ `http://truong.test/tai-lieu/thong-bao.pdf` rồi Enter:

```text
 [1] Trình duyệt: "truong.test là IP nào?"
       │
       ▼
 [2] DNS: tra file hosts → nếu không có thì hỏi máy chủ DNS → trả về 192.168.1.10
       │
       ▼
 [3] Mạng (tầng IP): gửi gói tin tới 192.168.1.10
       │
       ▼
 [4] Cổng dịch vụ (tầng TCP): bắt tay 3 bước với cổng 80
       │
       ▼
 [5] HTTP server (Nginx) nhận: "GET /tai-lieu/thong-bao.pdf, Host: truong.test"
       │   chọn đúng site theo Host (server_name)
       ▼
 [6] Hệ điều hành: Nginx xin đọc file /var/www/truong/tai-lieu/thong-bao.pdf
       │   kernel kiểm tra quyền: user www-data có được đọc không?
       ▼
 [7] Nginx trả "HTTP/1.1 200 OK" + nội dung file, ghi một dòng vào access.log
```

| Bước | Khái niệm | Ví dụ đời thường |
|---|---|---|
| DNS | Đổi **tên** thành **địa chỉ IP** | Danh bạ điện thoại: tên → số |
| IP | Địa chỉ của máy trong mạng | Địa chỉ nhà |
| Cổng (port) | Số hiệu dịch vụ trên một máy: 80 = HTTP, 443 = HTTPS, 22 = SSH | Số phòng trong toà nhà |
| HTTP server | Chương trình nhận yêu cầu web và trả nội dung (Nginx, Apache, IIS) | Nhân viên lễ tân |
| Hệ thống tập tin | Nơi chứa file trên ổ cứng, có phân quyền | Tủ hồ sơ có khoá |

### 5.2. Tên miền nội bộ

Trường không cần mua tên miền. Mỗi máy có một **file hosts** được tra **trước** cả máy chủ DNS:

| Hệ điều hành | Vị trí file hosts |
|---|---|
| Linux | `/etc/hosts` |
| Windows | `C:\Windows\System32\drivers\etc\hosts` (mở Notepad bằng quyền Administrator) |

Thêm một dòng `192.168.1.10   truong.test` là máy đó hiểu `truong.test` nằm ở `192.168.1.10`.

Cách "xịn" hơn là dựng máy chủ DNS nội bộ (BIND9 trên Linux, DNS Server trên Windows Server) để mọi máy trong trường tự hiểu, không phải sửa từng máy. Báo cáo nên **nhắc** phương án này dù chỉ làm bằng file hosts.

> Nên dùng đuôi `.test` hoặc `.internal`. Đuôi `.local` dễ xung đột với cơ chế mDNS của máy tính.

### 5.3. Tiến trình, PID và quyền

- **Tiến trình (process)** là chương trình đang chạy. Mỗi tiến trình có số hiệu **PID** và chạy dưới danh nghĩa một **user**.
- Nginx có 2 loại tiến trình:
  - **master** chạy bằng `root`, chỉ để đọc cấu hình và mở cổng 80 (cổng dưới 1024 cần quyền root).
  - **worker** chạy bằng `www-data` (user không đặc quyền), là tiến trình thực sự phục vụ khách.
- Vì sao worker không chạy root? Nếu kẻ tấn công lợi dụng lỗi của Nginx chiếm được worker, họ chỉ có quyền của `www-data`, không sửa được hệ thống.

**Quyền file trên Linux** (`chmod`):

| Số | Nghĩa | Dùng cho |
|---|---|---|
| `755` | Chủ: đọc/ghi/vào; người khác: đọc/vào | Thư mục web |
| `644` | Chủ: đọc/ghi; người khác: chỉ đọc | File web (`.html`, `.pdf`) |
| `640` | Chủ: đọc/ghi; nhóm: đọc; người khác: không | File log, file cấu hình có thông tin nhạy cảm |
| `600` | Chỉ chủ đọc/ghi | File mật khẩu, khoá |
| `700` | Chỉ chủ được vào | Thư mục backup |

Mỗi chữ số là tổng của: đọc = 4, ghi = 2, thực thi/vào thư mục = 1. Ví dụ 7 = 4 + 2 + 1, 5 = 4 + 1.

### 5.4. Mã trạng thái HTTP

| Mã | Nghĩa | Khi nào gặp trong đề này |
|---|---|---|
| **200** OK | Thành công | Truy cập trang bình thường (KT1) |
| **301 / 302** | Chuyển hướng | Chuyển HTTP sang HTTPS |
| **401** | Cần đăng nhập | Vào trang quản trị có Basic Auth mà chưa nhập mật khẩu |
| **403** Forbidden | Bị cấm | Vào trang quản trị từ IP không được phép, hoặc Nginx không có quyền đọc file |
| **404** Not Found | Không có file | Gõ sai đường dẫn |
| **500** | Lỗi phía máy chủ | Ứng dụng lỗi |
| **502 / 503 / 504** | Proxy không gọi được phía sau / dịch vụ không sẵn sàng / quá thời gian | Có reverse proxy mà dịch vụ sau nó chết |

Nhóm 2xx là thành công, 3xx là chuyển hướng, 4xx là **lỗi phía người dùng**, 5xx là **lỗi phía máy chủ**.

### 5.5. Vai trò của hệ điều hành

Câu hỏi "giải thích vai trò hệ điều hành" trong yêu cầu 3 muốn bạn chỉ ra những việc **hệ điều hành làm hộ Nginx**:

| Việc | Hệ điều hành làm gì | Quan sát bằng |
|---|---|---|
| Quản lý tiến trình | Tạo tiến trình, cấp PID, lập lịch chia CPU giữa các worker | `ps`, `top` |
| Quản lý bộ nhớ | Cấp RAM cho mỗi tiến trình, dùng RAM thừa làm bộ đệm file | `free -h`, `top` |
| Quản lý tập tin | Đọc file từ ổ cứng, **kiểm tra quyền** trước khi cho đọc | `ls -l`, lỗi 403 khi sai quyền |
| Quản lý mạng | Ngăn xếp TCP/IP, mở cổng, nhận kết nối, chuyển gói tin vào đúng tiến trình | `ss -tlnp` |
| Bảo mật | Phân quyền user, tường lửa | `id`, `ufw status` |

---

## 6. Yêu cầu bắt buộc 1–4: hiểu và làm từng bước

Các lệnh dưới đây dùng **Ubuntu + Nginx**. Nếu nhóm làm trên Windows thì xem bảng tương đương ở cuối mục.

### Yêu cầu 1 – Vẽ đường đi yêu cầu

> *"Vẽ đường đi yêu cầu từ trình duyệt qua DNS, IP, cổng dịch vụ đến HTTP server và hệ thống tập tin."*

**Nghĩa là:** vẽ sơ đồ như mục 5.1, nhưng điền **thông số thật** của nhóm (IP, cổng, tên miền, đường dẫn thư mục).

**Làm:**
1. Vẽ sơ đồ bằng draw.io (miễn phí, chạy trên trình duyệt): máy khách → DNS/hosts → máy chủ (IP:cổng) → Nginx → thư mục web.
2. Ghi lên mỗi mũi tên: giao thức và thông số (`DNS: truong.test → 192.168.1.10`, `TCP 80`, `GET /index.html`…).
3. Đánh dấu tầng OSI của từng bước (tầng 7 HTTP/DNS, tầng 4 TCP, tầng 3 IP).

**Bằng chứng:** file sơ đồ (`.drawio` + ảnh `.png`) và ảnh chụp chứng minh từng bước có thật:
```bash
nslookup truong.test      # hoặc: ping truong.test → thấy IP 192.168.1.10
ss -tlnp | grep :80       # Nginx đang nghe cổng 80
curl -I http://truong.test # nhận HTTP/1.1 200 OK
```

### Yêu cầu 2 – Triển khai web, tên miền nội bộ, thư mục, quyền

> *"Triển khai Web trên Linux hoặc Windows; cấu hình tên miền nội bộ, thư mục nội dung và quyền của tiến trình dịch vụ."*

**Bước 1: cài Nginx**
```bash
sudo apt update && sudo apt install -y nginx
nginx -v                         # ghi phiên bản vào README
systemctl status nginx           # active (running)
```

**Bước 2: tạo thư mục nội dung (Document Root) và phân quyền**
```bash
sudo mkdir -p /var/www/truong/tai-lieu
echo "<h1>Trường ABC - Thông báo</h1>" | sudo tee /var/www/truong/index.html
echo "Thông báo mẫu" | sudo tee /var/www/truong/tai-lieu/thong-bao-mau.txt
sudo chown -R root:www-data /var/www/truong      # chủ root, nhóm www-data
sudo find /var/www/truong -type d -exec chmod 755 {} \;
sudo find /var/www/truong -type f -exec chmod 644 {} \;
```
Nginx chỉ cần **đọc**, không cần ghi. Nếu kẻ tấn công chiếm được worker cũng không sửa được nội dung web.

**Bước 3: tạo site cho tên miền nội bộ**

File `/etc/nginx/sites-available/truong`:
```nginx
server {
    listen 80;
    server_name truong.test;          # tên miền nội bộ
    root /var/www/truong;             # thư mục nội dung
    index index.html;

    access_log /var/log/nginx/truong_access.log;
    error_log  /var/log/nginx/truong_error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/truong /etc/nginx/sites-enabled/
sudo nginx -t                    # kiểm tra cú pháp TRƯỚC khi nạp
sudo systemctl reload nginx
```

**Bước 4: cấu hình tên miền ở máy khách** – thêm `192.168.1.10   truong.test` vào file hosts (mục 5.2).

**Bước 5: chứng minh tiến trình không chạy root**
```bash
ps -o user,pid,ppid,cmd -C nginx
# root      1234 ... nginx: master process
# www-data  1235 ... nginx: worker process
```

**Bằng chứng:** file cấu hình site, ảnh `ls -l /var/www/truong`, ảnh `ps` ở trên, ảnh trình duyệt máy khách mở `http://truong.test`.

### Yêu cầu 3 – Quan sát khi có nhiều yêu cầu

> *"Quan sát mã trạng thái HTTP, log truy cập, PID và CPU/RAM khi có nhiều yêu cầu; giải thích vai trò hệ điều hành."*

**Nghĩa là:** bắn thật nhiều yêu cầu vào web, trong lúc đó quan sát 4 thứ, rồi giải thích hệ điều hành đã làm gì.

**Bước 1: chuẩn bị 3 cửa sổ terminal**
```bash
# Cửa sổ 1 – log thời gian thực
sudo tail -f /var/log/nginx/truong_access.log

# Cửa sổ 2 – CPU/RAM của riêng các tiến trình nginx
top -p $(pgrep -d, nginx)

# Cửa sổ 3 – bắn tải (cài: sudo apt install apache2-utils)
date; ab -n 2000 -c 50 http://truong.test/ | tee ket_qua_ab.txt
```
`-n 2000` = tổng 2000 yêu cầu, `-c 50` = 50 yêu cầu cùng lúc.

**Bước 2: tạo thêm vài mã trạng thái khác nhau** để log có 200, 404, 403:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/khong-ton-tai
```

**Bước 3: thống kê mã trạng thái từ log**
```bash
awk '{print $9}' /var/log/nginx/truong_access.log | sort | uniq -c
#   1998 200
#      2 404
```
Cột thứ 9 trong log mặc định của Nginx là mã trạng thái.

**Bước 4: ghi số liệu vào bảng**

| Chỉ số | Trước khi bắn tải | Trong khi bắn tải |
|---|---|---|
| CPU của nginx | .... % | .... % |
| RAM của nginx | .... MB | .... MB |
| Số worker (PID) | .... | .... |
| Requests per second | – | .... |
| Thời gian phản hồi trung bình | – | .... ms |
| Số yêu cầu lỗi | – | .... |

**Bằng chứng:** file `ket_qua_ab.txt` (dữ liệu đo gốc), ảnh `top` trong lúc bắn tải, ảnh thống kê log. Phần giải thích vai trò hệ điều hành dùng bảng ở mục 5.5.

### Yêu cầu 4 – Giới hạn quản trị, sao lưu, phục hồi, HTTPS

> *"Cấu hình giới hạn truy cập quản trị, sao lưu nội dung và demo phục hồi; trình bày phương án HTTPS cho triển khai thực tế."*

**(a) Giới hạn truy cập trang quản trị** – hai lớp: lọc IP và mật khẩu.
```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd quantri    # tạo tài khoản quản trị
sudo chown root:www-data /etc/nginx/.htpasswd && sudo chmod 640 /etc/nginx/.htpasswd
```
Thêm vào khối `server` của site:
```nginx
location /admin/ {
    allow 192.168.1.0/24;      # chỉ máy trong LAN của trường
    deny  all;                 # còn lại bị chặn → 403
    auth_basic "Khu vuc quan tri";
    auth_basic_user_file /etc/nginx/.htpasswd;   # chưa nhập mật khẩu → 401
}
```
Thử: từ IP ngoài dải nhận **403**; từ IP trong dải mà không nhập mật khẩu nhận **401**; nhập đúng nhận **200**.

**(b) Sao lưu nội dung**

Script `/usr/local/bin/backup-web.sh`:
```bash
#!/bin/bash
set -euo pipefail
FILE=/backup/web-$(date +%Y%m%d-%H%M%S).tar.gz
tar -czf "$FILE" -C /var/www truong          # nén thư mục web
tar -tzf "$FILE" > /dev/null                 # kiểm tra file nén đọc được
ls -1t /backup/web-*.tar.gz | tail -n +8 | xargs -r rm --   # giữ 7 bản mới nhất
echo "Đã sao lưu: $FILE"
```
```bash
sudo mkdir -p /backup && sudo chmod 700 /backup
sudo chmod 700 /usr/local/bin/backup-web.sh
sudo crontab -e
# Thêm dòng: chạy lúc 2 giờ sáng mỗi ngày
0 2 * * * /usr/local/bin/backup-web.sh >> /var/log/backup-web.log 2>&1
```
Cron có 5 cột thời gian: `phút giờ ngày tháng thứ`. `0 2 * * *` = 2:00 mọi ngày.

**(c) Demo phục hồi** – chính là KT3, xem mục 7.

**(d) Phương án HTTPS** – đề chỉ yêu cầu **trình bày**, không bắt buộc làm. Nên trình bày 2 trường hợp:

| Trường hợp | Cách làm | Ghi chú |
|---|---|---|
| Triển khai thật, có tên miền công khai | **Let's Encrypt** qua `certbot --nginx`: chứng chỉ miễn phí, tự gia hạn 90 ngày | Cần tên miền thật và cổng 80 truy cập được từ Internet |
| Chỉ dùng trong mạng nội bộ | Tự tạo CA nội bộ (vd `mkcert`, hoặc CA của Windows Server), cài CA đó lên các máy trong trường | Chứng chỉ tự ký thông thường sẽ bị trình duyệt cảnh báo |

Kèm theo: chuyển hướng 80 sang 443 (`return 301 https://$host$request_uri;`), chỉ bật TLS 1.2/1.3, header HSTS. Làm thử được thì càng tốt.

### Bảng tương đương nếu làm trên Windows

| Việc | Ubuntu + Nginx | Windows + IIS |
|---|---|---|
| Cài web server | `apt install nginx` | Server Manager / "Turn Windows features on" → IIS |
| Thư mục nội dung | `/var/www/truong` | `C:\inetpub\truong` |
| User của tiến trình | `www-data` | `IIS AppPool\<tên pool>` |
| Phân quyền | `chown`, `chmod` | Tab Security của thư mục (ACL), `icacls` |
| Log | `/var/log/nginx/*.log` | `C:\inetpub\logs\LogFiles` |
| Xem tiến trình | `ps`, `top` | Task Manager, `Get-Process w3wp` |
| Đo tải | `ab` | `ab` (trong gói Apache), hoặc `hey`, `k6` |
| Lịch sao lưu | `cron` | Task Scheduler |
| Giới hạn IP | `allow` / `deny` | "IP Address and Domain Restrictions" |

---

## 7. Kiểm thử KT1–KT3: làm và chụp bằng chứng

### 7.1. Một ca kiểm thử đầy đủ trông như thế nào?

Thầy yêu cầu mỗi ca có đủ 6 cột. Ví dụ:

| Cột | Ví dụ với KT1 |
|---|---|
| Đầu vào | Máy khách `192.168.1.20`, file hosts đã trỏ `truong.test` → `192.168.1.10`, Nginx đang chạy |
| Thao tác | Mở `http://truong.test`, bấm tải `thong-bao-mau.txt` |
| Kết quả mong đợi | Trang hiển thị, file tải về đúng nội dung, log ghi mã 200 |
| Kết quả thực tế | (ghi đúng những gì thấy) |
| Đạt / chưa đạt | Đạt |
| Bằng chứng | `MinhChung/KT1_trinh_duyet_2026-11-20_0930.png`, `KT1_log.png` |

**Dấu thời gian:** trước mỗi ca, chạy `date` (Linux) hoặc `Get-Date` (Windows) rồi mới chạy lệnh kiểm thử, để ảnh chụp có cả giờ. Đặt tên file ảnh kèm ngày giờ.

### 7.2. KT1 – Truy cập trang và tải tài liệu bằng tên miền từ máy khách

**Điểm mấu chốt:** phải làm **từ máy khách** (máy khác với máy chủ), và dùng **tên miền** chứ không gõ IP.

1. Trên máy khách: `nslookup truong.test` hoặc `ping truong.test` → thấy IP máy chủ.
2. Mở trình duyệt vào `http://truong.test`, chụp màn hình.
3. Tải `http://truong.test/tai-lieu/thong-bao-mau.txt`, mở file ra.
4. Trên máy chủ: `sudo tail -n 5 /var/log/nginx/truong_access.log` → thấy dòng có IP máy khách và mã `200`.

### 7.3. KT2 – Đổi sai DNS rồi dừng dịch vụ, phân biệt hai lỗi

Đây là ca **quan trọng nhất** về mặt kiến thức, vì nó trả lời câu hỏi "lỗi ở tầng nào".

**Trường hợp 1 – sai DNS:** sửa file hosts của máy khách thành IP không tồn tại, vd `192.168.1.99 truong.test` (hoặc xoá dòng đó và gõ tên sai).

**Trường hợp 2 – dừng dịch vụ:** trả file hosts về đúng, trên máy chủ chạy `sudo systemctl stop nginx`.

Ở mỗi trường hợp chạy cùng bộ lệnh trên máy khách:
```bash
date
nslookup truong.test
ping -c 4 truong.test        # Windows: ping -n 4 truong.test
curl -v http://truong.test
```
Và trên máy chủ: `systemctl status nginx`, `ss -tlnp | grep :80`.

**Bảng phân biệt (điền khi làm):**

| Dấu hiệu | TH1 – Sai DNS | TH2 – Dịch vụ dừng |
|---|---|---|
| Tên miền ra IP nào | Không ra IP, hoặc ra IP sai | Ra **đúng** IP máy chủ |
| `ping` | Không phân giải được tên, hoặc hết thời gian chờ | **Thành công** (máy chủ vẫn bật) |
| `curl` | `Could not resolve host`, hoặc treo tới khi hết giờ | `Connection refused` **ngay lập tức** |
| Trình duyệt | `DNS_PROBE_FINISHED_NXDOMAIN` hoặc `ERR_CONNECTION_TIMED_OUT` | `ERR_CONNECTION_REFUSED` |
| Trên máy chủ | Nginx vẫn chạy bình thường, log không có dòng mới | `systemctl status nginx` = inactive; cổng 80 không còn ai nghe |
| Lỗi nằm ở đâu | Bước phân giải tên (DNS) | Bước cổng dịch vụ / HTTP server |

**Vì sao "Connection refused" khác "timeout"?** Khi máy chủ còn sống nhưng không ai nghe cổng 80, hệ điều hành máy chủ **chủ động trả lời** "từ chối" (gói TCP RST), nên báo lỗi ngay. Khi IP không tồn tại, không ai trả lời cả, máy khách phải đợi tới hết giờ.

Làm xong nhớ `sudo systemctl start nginx` và sửa lại file hosts.

### 7.4. KT3 – Khôi phục nội dung từ bản sao

1. Chạy sao lưu: `sudo /usr/local/bin/backup-web.sh`, chụp ảnh `ls -lh /backup`.
2. Giả lập sự cố: `sudo rm -rf /var/www/truong/*`. Truy cập lại, chụp lỗi (403 hoặc 404).
3. Khôi phục:
   ```bash
   LATEST=$(ls -1t /backup/web-*.tar.gz | head -1)
   sudo tar -xzf "$LATEST" -C /var/www
   sudo chown -R root:www-data /var/www/truong      # đặt lại quyền
   ```
4. Truy cập lại từ máy khách, chụp trang hiển thị bình thường. So nội dung file tài liệu với bản gốc.

Ghi lại **thời gian khôi phục** (từ lúc bắt đầu bước 3 tới lúc trang truy cập lại được). Con số này dùng cho phần đánh giá.

---

## 8. Phân công SV1–SV4: ai làm gì

Mỗi người phụ trách một mảng, nộp **sản phẩm riêng**, nhưng **tất cả cùng tham gia kiểm thử**.

| Vai trò | Phần việc trong đề | Sản phẩm riêng nên nộp | Câu dễ bị hỏi |
|---|---|---|---|
| **SV1** – Luồng truy cập và DNS | Yêu cầu 1; cấu hình file hosts / DNS nội bộ; chủ trì KT2 phần DNS | Sơ đồ luồng, file hosts, cấu hình BIND9 (nếu làm), ảnh `nslookup` | "DNS phân giải theo thứ tự nào? Sai DNS thì triệu chứng ra sao?" |
| **SV2** – Cài web, cấu hình hệ điều hành | Yêu cầu 2; cài Nginx, site, Document Root, user tiến trình, tường lửa | File cấu hình Nginx, ảnh `ps` thấy worker chạy `www-data`, ảnh `ufw status` | "Vì sao master chạy root mà worker không? `nginx -t` để làm gì?" |
| **SV3** – Quyền, log và sao lưu | Yêu cầu 4 (a)(b)(c); phân quyền thư mục, cấu hình log, script backup + cron; chủ trì KT3 | Script backup, crontab, cấu hình `/admin/`, ảnh 401/403, ảnh khôi phục | "`755` và `644` nghĩa là gì? Backup để chung ổ với dữ liệu có ổn không?" |
| **SV4** – Đo tài nguyên và chẩn đoán lỗi | Yêu cầu 3; bắn tải, đo CPU/RAM/PID, thống kê log; chủ trì KT2 phần dịch vụ dừng | File `ket_qua_ab.txt`, bảng số liệu, ảnh `top`, bảng phân biệt KT2 | "Đông khách thì CPU hay RAM tăng trước? 502 và 503 khác nhau ra sao?" |

Nhóm 5 người thì có thêm vai **SV5** theo hướng dẫn chung của thầy. Họ tên và mã sinh viên của từng vai phải ghi vào **README**.

> Trong thư mục này đã có [HUONG_DAN_SV2_UBUNTU.md](HUONG_DAN_SV2_UBUNTU.md) và [HUONG_DAN_SV2_ADVANCE.md](HUONG_DAN_SV2_ADVANCE.md) hướng dẫn chi tiết cho vai SV2.

---

## 9. Câu hỏi chuẩn bị: ping được mà web không mở

> *"Ping thành công nhưng Website không mở được thì kiểm tra gì tiếp?"*

**Ping thành công chứng minh được gì?** Tên miền đã ra IP (DNS ổn) và máy chủ còn sống, đường mạng tầng IP thông. Nghĩa là lỗi nằm **cao hơn** tầng IP. Ping dùng giao thức ICMP, không đi qua cổng 80, nên **không nói gì** về web server.

Kiểm tra lần lượt từ dưới lên:

| # | Kiểm tra | Lệnh | Nếu sai thì |
|---|---|---|---|
| 1 | Cổng 80 có mở tới được không | Máy khách: `curl -v http://truong.test` hoặc `Test-NetConnection truong.test -Port 80` (Windows) | `Connection refused` → bước 2; treo tới hết giờ → bước 3 |
| 2 | Nginx có đang chạy và nghe cổng 80 không | Máy chủ: `systemctl status nginx`, `ss -tlnp \| grep :80` | Khởi động lại; xem `journalctl -u nginx` để biết lý do chết |
| 3 | Tường lửa có chặn không | `sudo ufw status` | `sudo ufw allow 80/tcp` |
| 4 | Cấu hình có lỗi không | `sudo nginx -t` | Sửa đúng dòng báo lỗi |
| 5 | Có đúng site không | Xem `server_name` có đúng `truong.test`, trình duyệt có gõ đúng tên | Sai thì Nginx trả site mặc định |
| 6 | Mã trạng thái là gì | `curl -I http://truong.test` + `error.log` | 403 → kiểm tra quyền thư mục; 404 → sai `root` hoặc thiếu file; 5xx → xem `error.log` |
| 7 | Trình duyệt có nhớ dữ liệu cũ không | Thử cửa sổ ẩn danh, `ipconfig /flushdns` | Xoá cache |

**Mẹo trả lời khi bảo vệ:** nói theo thứ tự tầng ("ping được nghĩa là tầng 3 ổn, em kiểm tra tầng 4 là cổng, rồi tầng 7 là HTTP"), mỗi bước nêu lệnh và triệu chứng. Thầy chấm cách tư duy theo tầng, không chấm việc thuộc lệnh.

---

## 10. Phần mở rộng tự chọn và chỗ của Kubernetes

> *"Mở rộng tự chọn: triển khai và kiểm thử một phương án thay thế cho một thành phần của đề; so sánh bằng cùng tiêu chí và số liệu."*

### 10.1. Câu này đòi hỏi 3 thứ

1. **Một phương án thay thế** cho **một thành phần**. Ví dụ: Nginx thay bằng Apache; file hosts thay bằng máy chủ DNS BIND9; cách chạy một máy thay bằng Kubernetes.
2. **Triển khai và kiểm thử thật** phương án đó, không chỉ mô tả.
3. **So sánh bằng cùng tiêu chí và số liệu**: chạy **cùng một bài đo** trên cả hai phương án, đặt số liệu cạnh nhau.

### 10.2. Phần Kubernetes của bạn nằm ở đây

Phần [triển khai trên Kubernetes](bao_cao_mo_rong_kubernetes.md) là phương án thay thế cho **thành phần triển khai và vận hành** (Nginx + systemd một máy → K3s + Traefik + GitOps). Hiện các báo cáo đã có bảng so sánh **tính năng**, nhưng **còn thiếu bảng so sánh số liệu đo**. Đó là thứ đề đòi hỏi rõ.

**Bảng so sánh nên có (cùng bài đo, cùng tiêu chí):**

| Tiêu chí | Cách đo (giống nhau cho cả hai) | Nginx một máy | Kubernetes |
|---|---|---|---|
| Thông lượng | `ab -n 2000 -c 50` vào trang chủ, lấy Requests per second | .... | .... |
| Độ trễ trung bình | Cùng lần đo trên, lấy Time per request | .... ms | .... ms |
| RAM sử dụng | `free -h` / `kubectl top pods` khi chạy không tải | .... | .... |
| Gián đoạn khi cập nhật bản mới | `curl` mỗi 0,5 giây trong lúc cập nhật, đếm số lần lỗi | .... lỗi | .... lỗi |
| Thời gian phục hồi khi tiến trình chết | Giết tiến trình (`kill -9` / xoá Pod), đo tới khi trả 200 lại | .... giây | .... giây |
| Thời gian khôi phục dữ liệu | Quy trình KT3 trên mỗi mô hình | .... phút | .... phút |
| Số bước làm tay để triển khai bản mới | Đếm số lệnh phải gõ | .... | .... |

**Lưu ý để so sánh công bằng:**
- Đo **cùng máy**, cùng lúc ít việc khác đang chạy, mỗi bài đo chạy 3 lần lấy trung bình.
- Kubernetes đi qua Cloudflare và Internet nên độ trễ chắc chắn cao hơn bản LAN. Nên đo thêm một lần **trong nội bộ** (`kubectl port-forward`) để so sánh công bằng, và **giải thích** chênh lệch thay vì giấu đi.
- Kubernetes không nhất thiết "nhanh hơn". Ưu điểm của nó là **tự phục hồi, không gián đoạn, an toàn hơn**, đổi lại **tốn RAM hơn và phức tạp hơn**. Nói thẳng điều này trong phần đánh giá sẽ được điểm hơn là khen một chiều.

### 10.3. Đừng quên điều kiện

Thầy ghi: *mức nâng cao là lựa chọn sau khi hoàn thành yêu cầu bắt buộc, không thay thế minh chứng lõi và không tự động được cộng điểm.* Nghĩa là:
- Yêu cầu 1–4 và KT1–KT3 trên mô hình Nginx vẫn phải đủ bằng chứng.
- Phần Kubernetes chỉ có giá trị khi có kiểm thử và số liệu so sánh.

---

## 11. Báo cáo cá nhân: điền từng mục thế nào

Bản nháp báo cáo cá nhân cho phần Kubernetes đã có ở [bao_cao_ca_nhan_mo_rong_kubernetes.md](bao_cao_ca_nhan_mo_rong_kubernetes.md). Bảng dưới giải thích mỗi mục của [mẫu](mau_bao_cao_ca_nhan.md) muốn gì.

| Mục | Thầy muốn đọc thấy | Viết thế nào cho đúng | Tránh |
|---|---|---|---|
| 1. Thông tin | Bạn là ai, vai trò gì | Ghi đúng vai SV1–SV4 của mình | Để trống thời gian thực hiện |
| 2. Nhiệm vụ | Danh sách việc **thật** đã làm | Mỗi dòng một việc kỹ thuật cụ thể, ghi tên sản phẩm (file) | Kê việc người khác làm; viết chung chung "tìm hiểu Linux" |
| 3. Công việc trực tiếp | Cách làm và **lý do chọn** | Đủ chi tiết để người khác làm lại; mỗi thông số quan trọng có "vì sao" | Chép nguyên báo cáo nhóm |
| 4. Minh chứng | Đường dẫn tới từng bằng chứng | Đường dẫn tương đối trong thư mục nộp, hoặc phút:giây trong video; ảnh có chú thích | Ghi "xem báo cáo nhóm" |
| 5. Kiểm thử | Ca nào **bạn** chạy, kết quả thật | Số liệu thật, có mã minh chứng; ghi rõ mình làm phần nào nếu làm chung | Điền số liệu ước lượng |
| 6. Vấn đề đã gặp | Bạn biết gỡ lỗi | Lỗi có thật; tách rõ **điều đã kiểm chứng** với **điều chỉ đoán** | Bịa lỗi cho có |
| 7. Tiến độ | Bạn làm đều, có phối hợp | Mốc thời gian lấy từ lịch sử commit hoặc ngày chụp ảnh | Ghi một mốc duy nhất "tuần cuối" |
| 8. Hiểu hệ thống | Bạn thấy được bức tranh chung | Phần của mình nhận gì từ ai, đưa gì cho ai; kiến thức môn học đã dùng | Liệt kê lý thuyết không gắn với việc làm |
| 9. Nguồn và AI | Trung thực | Ghi rõ dùng AI vào việc gì, phần tự sửa, cách kiểm chứng | Ghi "Không sử dụng" khi có dùng |
| 10. Cam kết | Bạn chịu trách nhiệm | Ký tên, ghi ngày | – |

**"Phân biệt điều đã kiểm chứng với giả thuyết"** (mục 6) nghĩa là:
- *Đã kiểm chứng:* "Tôi chạy `ls -lh` thấy file chỉ 20 bytes; chạy lại `pg_dump` bằng tay thì báo `Connection refused`."
- *Giả thuyết:* "Có thể do NetworkPolicy chưa kịp áp luật." (nếu chưa thử chứng minh)

---

## 12. Buổi bảo vệ: chuẩn bị gì

### 12.1. Thầy sẽ làm gì

Mỗi người sẽ:
1. **Trình bày** phần việc của mình (ngắn, 2–3 phút).
2. **Mở minh chứng** trước mặt thầy (file cấu hình, ảnh, log).
3. **Thực hiện một thao tác** hoặc **xử lý một thay đổi nhỏ** do thầy yêu cầu.
4. Trả lời câu hỏi, có thể cả về **kiến trúc chung** chứ không riêng phần mình.

### 12.2. Các "thay đổi nhỏ" hay gặp và cách làm

| Thầy yêu cầu | Cách làm (Nginx) | Kiểm tra |
|---|---|---|
| Đổi web sang cổng 8080 | Sửa `listen 8080;`, mở tường lửa `ufw allow 8080/tcp` | `nginx -t`, `reload`, `curl http://truong.test:8080` |
| Thêm tên miền thứ hai | Thêm vào `server_name truong.test www.truong.test;` + file hosts | `curl -I http://www.truong.test` |
| Chặn một IP cụ thể | `deny 192.168.1.20;` đặt trước `allow` | Từ máy đó nhận 403 |
| Thêm một trang mới | Tạo file trong Document Root, đặt đúng quyền `644` | Truy cập được, mã 200 |
| Cố tình làm sai quyền rồi sửa | `chmod 600` một file → 403; sửa lại `644` | Xem `error.log` thấy `Permission denied` |
| Đổi giờ chạy backup | Sửa dòng crontab | `sudo crontab -l` |
| Xem ai vừa truy cập | `tail` access log | Chỉ ra IP, giờ, mã trạng thái |
| Kubernetes: tăng số bản chạy | Sửa `replicas` trong Git (không sửa tay, vì ArgoCD sẽ đưa về) | `kubectl get pods -n portal` |

**Quy tắc vàng khi sửa cấu hình trước mặt thầy:** luôn chạy `sudo nginx -t` **trước** `reload`. Cấu hình lỗi mà reload thẳng có thể làm sập web ngay giữa buổi bảo vệ.

### 12.3. Câu hỏi nên tự luyện trước

- Vẽ lại luồng yêu cầu và giải thích từng bước (mục 5.1).
- Vì sao worker Nginx không chạy root?
- `755` và `644` khác nhau chỗ nào? Vì sao thư mục cần quyền `x`?
- Sai DNS và dịch vụ dừng khác nhau thế nào về triệu chứng? (KT2)
- Ping được mà web không mở thì kiểm tra gì? (mục 9)
- 401 và 403 khác nhau ra sao?
- Backup nằm cùng ổ với dữ liệu có rủi ro gì? Quy tắc 3-2-1 là gì? *(3 bản sao, trên 2 loại thiết bị lưu trữ, 1 bản để ở nơi khác)*
- Khi đông khách, hệ điều hành làm gì? Tài nguyên nào cạn trước?
- Muốn có HTTPS thì làm thế nào, trong mạng nội bộ và ngoài Internet?
- (Phần mở rộng) Kubernetes hơn và kém mô hình một máy ở đâu, có số liệu nào chứng minh?

---

## 13. Cấu trúc thư mục nộp bài gợi ý

```text
Lop_Nhom_DeTai05/
├── README.md                     # phiên bản, cách dựng lại, cách chạy kiểm thử, họ tên + MSSV + vai SV1–SV4
├── BaoCao/
│   ├── BaoCaoNhom.pdf            # 12–18 trang + phụ lục
│   └── CaNhan/
│       ├── Lop_Nhom_DeTai_MSSV1_BaoCaoCaNhan.docx
│       └── ...
├── SoDo/
│   ├── luong_truy_cap.drawio
│   └── luong_truy_cap.png
├── CauHinh/
│   ├── nginx/truong.conf
│   ├── hosts.txt
│   ├── backup-web.sh
│   └── crontab.txt
├── KiemThu/
│   ├── BangKiemThu.xlsx          # đầu vào, thao tác, mong đợi, thực tế, đạt/chưa đạt, bằng chứng
│   └── DuLieuDoGoc/
│       ├── ket_qua_ab_lan1.txt
│       └── access_log_trich.txt
├── MinhChung/
│   ├── KT1_trinh_duyet_2026-11-20_0930.png
│   └── ...
├── MoRong_Kubernetes/            # cấu hình và minh chứng phần mở rộng
└── Video/
    └── demo.mp4                  # 5–7 phút (hoặc link)
```

**README tối thiểu cần có:**
1. Danh sách thành viên: họ tên, MSSV, vai SV1–SV4.
2. Môi trường và phiên bản: hệ điều hành, Nginx, công cụ đo.
3. Cách dựng lại từ đầu: các bước cài đặt, chép file cấu hình đi đâu.
4. Cách chạy kiểm thử KT1–KT3.
5. Tài khoản demo (dữ liệu giả).

---

## 14. Checklist cuối cùng trước khi nộp

**Hồ sơ nhóm**
- [ ] Báo cáo 12–18 trang, đủ 7 phần: yêu cầu, giả định, kiến trúc, triển khai, kiểm thử, đánh giá, tham khảo
- [ ] Sơ đồ hệ thống có thông số thật
- [ ] Bảng tài nguyên / IP / cổng / user / quyền
- [ ] Toàn bộ file cấu hình, script
- [ ] README có phiên bản, cách dựng lại, cách chạy kiểm thử, họ tên + MSSV
- [ ] Bảng kiểm thử đủ 6 cột cho KT1, KT2, KT3
- [ ] Mọi ảnh bằng chứng có ngày giờ
- [ ] Dữ liệu đo gốc (file `ab`, trích log)
- [ ] Video 5–7 phút
- [ ] Phần mở rộng (nếu có) có bảng so sánh số liệu cùng tiêu chí

**Hồ sơ cá nhân (mỗi người)**
- [ ] Báo cáo cá nhân đủ 10 mục, không chép nguyên báo cáo nhóm
- [ ] Có ít nhất một sản phẩm kỹ thuật riêng
- [ ] Minh chứng ghi đường dẫn cụ thể, không ghi "xem báo cáo nhóm"
- [ ] Khai báo trung thực việc dùng AI
- [ ] Ký cam kết

**An toàn**
- [ ] Không có mật khẩu, khoá, token thật trong báo cáo, ảnh, file cấu hình
- [ ] Chỉ dùng dữ liệu giả

---

## 15. Những lỗi hay gặp làm mất điểm

| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Làm KT1 ngay trên máy chủ, gõ `localhost` | Không chứng minh được DNS và mạng | Luôn dùng **máy khách khác** và **tên miền** |
| Ảnh không có ngày giờ | Bằng chứng không được công nhận | Chạy `date` trước lệnh, để lộ đồng hồ |
| Chỉ ghi số liệu vào báo cáo, không nộp file gốc | Thiếu "dữ liệu đo gốc" | Luôn `| tee ket_qua.txt` khi đo |
| Cả nhóm chép chung một báo cáo cá nhân | Vi phạm yêu cầu, mất điểm cá nhân | Mỗi người viết phần mình làm |
| Một người chỉ làm slide | Người đó thiếu sản phẩm kỹ thuật riêng | Chia đều theo SV1–SV4 |
| Bịa số liệu "cho đẹp" | Bị phát hiện khi thầy bảo chạy lại | Ghi đúng số đo được, giải thích nếu xấu |
| Không nói hạn chế | Mất điểm tiêu chí "đánh giá giới hạn" | Luôn có mục hạn chế và hướng cải thiện |
| Làm phần mở rộng nhưng bỏ dở phần bắt buộc | Mở rộng không được tính | Xong lõi trước, mở rộng sau |
| Phần mở rộng chỉ so sánh bằng lời | Không đúng yêu cầu "so sánh bằng số liệu" | Đo cùng bài trên hai phương án (mục 10.2) |
| Dùng AI nhưng không hiểu phần đã nộp | Mất điểm vấn đáp (20 điểm) | Tự chạy lại, tự giải thích từng dòng cấu hình |
| Lộ mật khẩu trong ảnh chụp | Vi phạm quy định | Che hoặc dùng dữ liệu giả |
