# Lệnh chụp ảnh và kết quả thực hành SV2 (Ubuntu) – Cơ bản & Nâng cao

> Máy thực hành: `viet@viet-BATTLE-AX-B760M-T-WIFI`, Ubuntu 26.04.1 LTS, Nginx 1.28.3.
> Chạy **từng khối**, chụp ảnh cả **lệnh + kết quả** (thấy dấu nhắc `user@host`).
> Dùng `| cat` thay cho `--no-pager` để tránh lỗi `unrecognized option`.
> Đừng chụp mật khẩu, JWT secret, cột `passwordHash`.
> Kết quả trong file này lấy từ tài liệu tổng hợp *Báo cáo Lệnh Chụp Ảnh Thực Hành SV2 (Cơ Bản & Nâng Cao)* (Google Docs).

## Mục lục

- **Phần A – Cơ bản (theo `HUONG_DAN_SV2_UBUNTU.md`)**
  - Mục 1 – C1–C6: Ảnh 1–10
  - Mục 2 – C7: bằng chứng "ít quyền", Ảnh 11–14
  - Mục 3 – C8: mã HTTP và đo tải, Ảnh 15–18
  - Mục 4 – KT2: hai lỗi "không vào được web"
  - Mục 5 – KT3: sao lưu và khôi phục
- **Phần B – Nâng cao (theo `HUONG_DAN_SV2_ADVANCE.md`)**
  - B1 – Lỗi trong tài liệu gốc đã phát hiện và khắc phục
  - B2 – Cấp 1: Triển khai chuyên nghiệp
  - B3 – Cấp 2: Nginx chạy 100% không root
  - B4 – Cấp 3: Sandbox systemd và cgroup
  - B5 – Cấp 4: AppArmor (MAC)
  - B6 – Cấp 5: Tinh chỉnh kernel và mount
  - B7 – Cấp 6 & 7: Tự chấm điểm và phòng lab lỗi
  - B8 – So sánh Nginx đã gia cố và Apache mặc định
  - B9 – Phụ lục cấu hình hoàn chỉnh
- **Danh sách đối chiếu cuối cùng**

---

# PHẦN A – CƠ BẢN

## Mục 1 – Đã làm xong (C1–C6)

### Ảnh 1 – Thông tin máy
```bash
lsb_release -ds
uname -r
ip -4 addr show | grep inet
```
**Kết quả:**
```
Ubuntu 26.04.1 LTS
7.0.0-42-generic
    inet 127.0.0.1/8 scope host lo
    inet 192.168.102.114/24 brd 192.168.102.255 scope global dynamic noprefixroute enp5s0
    inet 100.83.219.103/32 scope global tailscale0
```
✅ Ubuntu 26.04.1 LTS · kernel 7.0.0-42 · IP LAN `192.168.102.114/24` · Tailscale `100.83.219.103`

### Ảnh 2 – Nginx đã cài và chạy
```bash
nginx -v
systemctl status nginx | cat
```
**Kết quả:**
```
nginx version: nginx/1.28.3 (Ubuntu)
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Thu 2026-11-05 08:11:23 +07; 1 day 2h ago
 Invocation: 1836d047b6684462b3a587f4adaf9a96
       Docs: man:nginx(8)
   Main PID: 46587 (nginx)
      Tasks: 13 (limit: 37634)
     Memory: 11M (peak: 12.8M)
        CPU: 90ms
     CGroup: /system.slice/nginx.service
             ├─46587 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─46588 "nginx: worker process"
             ├─46589 "nginx: worker process"
             ├─46590 "nginx: worker process"
             ├─46591 "nginx: worker process"
             ├─46592 "nginx: worker process"
             ├─46593 "nginx: worker process"
             ├─46594 "nginx: worker process"
             ├─46596 "nginx: worker process"
             ├─46597 "nginx: worker process"
             ├─46598 "nginx: worker process"
             ├─46599 "nginx: worker process"
             └─46600 "nginx: worker process"

Nov 05 08:11:23 viet-BATTLE-AX-B760M-T-WIFI systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Nov 05 08:11:23 viet-BATTLE-AX-B760M-T-WIFI systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
```
✅ `Active: active (running)` · `enabled` (tự khởi động cùng máy) · 1 master + 12 worker

### Ảnh 3 – Thư mục nội dung và phân quyền
```bash
ls -l /var/www/school
namei -l /var/www/school/index.html
id svc_nginx
```
**Kết quả:**
```
ls: cannot open directory '/var/www/school': Permission denied
f: /var/www/school/index.html
drwxr-xr-x root root      /
drwxr-xr-x root root      var
drwxr-xr-x root root      www
drwxr-x--- root svc_nginx school
                           index.html - Permission denied
uid=997(svc_nginx) gid=973(svc_nginx) groups=973(svc_nginx)
```
✅ Thư mục `school` là `drwxr-x--- root:svc_nginx` → user thường (`viet`) không xem được nội dung – đúng thiết kế

### Ảnh 4 – Đặc quyền tối thiểu
```bash
sudo -u svc_nginx cat /var/www/school/index.html | head -3
sudo -u svc_nginx touch /var/www/school/hack.txt
sudo -u nobody cat /var/www/school/index.html
```
**Kết quả:**
```
<!doctype html>
<html lang="vi">
  <head>
touch: cannot touch '/var/www/school/hack.txt': Permission denied
cat: /var/www/school/index.html: Permission denied
```
✅ Lệnh 1 đọc được · Lệnh 2 và 3 báo `Permission denied`

### Ảnh 5 – Tên miền nội bộ
```bash
cat /etc/hosts
getent hosts truong.test
ping -c 2 truong.test
```
**Kết quả:**
```
127.0.0.1 localhost
127.0.1.1 viet-BATTLE-AX-B760M-T-WIFI

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
127.0.0.1    truong.test
127.0.0.1       truong.test
PING truong.test (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.019 ms
64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.079 ms

--- truong.test ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1039ms
rtt min/avg/max/mdev = 0.019/0.049/0.079/0.030 ms
```
✅ `127.0.0.1   truong.test` · ping 0% packet loss
> ⚠️ `/etc/hosts` đang có **2 dòng `truong.test` trùng nhau** – nên xoá bớt 1 dòng trước khi chụp lại.

### Ảnh 6 – Tường lửa
```bash
sudo ufw status numbered
```
**Kết quả:**
```
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] OpenSSH                    ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    192.168.102.0/24
[ 3] 80/tcp on tailscale0       ALLOW IN    Anywhere
[ 4] OpenSSH (v6)               ALLOW IN    Anywhere (v6)
[ 5] 80/tcp (v6) on tailscale0  ALLOW IN    Anywhere (v6)
```
✅ Có OpenSSH; cổng 80 chỉ mở cho dải LAN `192.168.102.0/24` và giao diện `tailscale0`

### Ảnh 7 – Cấu hình Nginx
```bash
cat /etc/nginx/sites-available/school
grep -n '^user' /etc/nginx/nginx.conf
ls -l /etc/nginx/sites-enabled/
```
**Kết quả:**
```nginx
# ===== Website trường học (Đề tài 05) =====
server {
    listen      80;                          # cổng dịch vụ
    server_name truong.test;                 # tên miền nội bộ

    root  /var/www/school;                   # THƯ MỤC NỘI DUNG
    index index.html;

    access_log /var/log/nginx/school.access.log school;   # log truy cập
    error_log  /var/log/nginx/school.error.log  warn;     # log lỗi

    server_tokens off;                       # ẩn số phiên bản Nginx (bảo mật cơ bản)

    gzip on;                                 # nén bớt dữ liệu cho nhẹ
    gzip_types text/css application/javascript application/json image/svg+xml;

    # Ứng dụng React: đường dẫn không phải file thật → trả index.html để React tự xử lý (/grades, /schedule...)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # File giao diện: cho trình duyệt nhớ 7 ngày
    location /assets/ {
        expires 7d;
    }

    # Tài liệu tải về: không có file thì trả 404 thật (để quan sát mã HTTP)
    location /tai-lieu/ {
        try_files $uri =404;
    }

    # Chặn file ẩn (.git, .env...)
    location ~ /\. {
        deny all;
    }
}
```
```
1:user svc_nginx;
total 0
lrwxrwxrwx 1 root root 33 Nov  5 08:06 school -> /etc/nginx/sites-available/school
```
✅ `user svc_nginx;` · trong `sites-enabled` chỉ có `school`, không còn `default`

### Ảnh 8 – Kiểm tra cú pháp
```bash
sudo nginx -t
```
**Kết quả:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
✅ `syntax is ok` và `test is successful`

### Ảnh 9 – Trạng thái dịch vụ sau khi restart
```bash
sudo systemctl restart nginx
systemctl status nginx | cat
```
**Kết quả:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-11-06 10:59:22 +07; 12ms ago
 Invocation: 763a6b5272a2429c96f57d521a5708a9
       Docs: man:nginx(8)
    Process: 79586 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 79589 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 79591 (nginx)
      Tasks: 13 (limit: 37634)
     Memory: 12.2M (peak: 12.2M)
        CPU: 74ms
```
✅ Khởi động lại thành công, PID master mới `79591`, 12.2 MB RAM

### Ảnh 10 – Trình duyệt (chụp cả thanh địa chỉ)
- Mở `http://truong.test/`
- Mở `http://truong.test/tai-lieu/thong-bao-mau.txt`

> ⬜ Chưa có trong tài liệu tổng hợp – cần chụp. Nên chụp thêm **từ một máy khác** trong LAN `192.168.102.0/24` hoặc qua Tailscale (máy khách thêm dòng `192.168.102.114 truong.test` vào file hosts) để đáp ứng KT1 "truy cập từ máy khách".

---

## Mục 2 – C7: bằng chứng "ít quyền" (quan trọng nhất)

### Ảnh 11 – Master = root, worker = svc_nginx
```bash
ps -eo pid,ppid,euser:20,comm | grep '[n]ginx'
```
**Kết quả:**
```
  79591       1 root                 nginx
  79592   79591 svc_nginx            nginx
  79593   79591 svc_nginx            nginx
  79594   79591 svc_nginx            nginx
  79595   79591 svc_nginx            nginx
  79596   79591 svc_nginx            nginx
  79597   79591 svc_nginx            nginx
  79598   79591 svc_nginx            nginx
  79600   79591 svc_nginx            nginx
  79601   79591 svc_nginx            nginx
  79602   79591 svc_nginx            nginx
  79603   79591 svc_nginx            nginx
  79604   79591 svc_nginx            nginx
```
✅ Một dòng `root` (master), các dòng còn lại `svc_nginx` (worker, PPID = master)

### Ảnh 12 – PID nào giữ cổng 80
```bash
sudo ss -ltnp 'sport = :80'
```
**Kết quả:**
```
State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process
LISTEN 0      511    0.0.0.0:80         0.0.0.0:*         users:(("nginx",pid=79604,fd=7),("nginx",pid=79603,fd=7),("nginx",pid=79602,fd=7),("nginx",pid=79601,fd=7),("nginx",pid=79600,fd=7),("nginx",pid=79598,fd=7),("nginx",pid=79597,fd=7),("nginx",pid=79596,fd=7),("nginx",pid=79595,fd=7),("nginx",pid=79594,fd=7),("nginx",pid=79593,fd=7),("nginx",pid=79592,fd=7),("nginx",pid=79591,fd=7))
```
✅ Cổng 80 ở trạng thái `LISTEN`, backlog (Send-Q) 511, do master `79591` và 12 worker cùng giữ socket

### Ảnh 13 – Cấu hình đang nạp đúng user
```bash
sudo nginx -T 2>/dev/null | grep -E '^\s*user '
```
**Kết quả:**
```
user svc_nginx;
```
✅

### Ảnh 14 – CPU/RAM các tiến trình nginx
```bash
ps -C nginx -o pid,user,%cpu,%mem,rss,cmd
```
**Kết quả:**
```
    PID USER     %CPU %MEM   RSS CMD
  79591 root      0.0  0.0  2352 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
  79592 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79593 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79594 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79595 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79596 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79597 svc_ngi+  0.0  0.0  5540 nginx: worker process
  79598 svc_ngi+  0.0  0.0  5476 nginx: worker process
  79600 svc_ngi+  0.0  0.0  5508 nginx: worker process
  79601 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79602 svc_ngi+  0.0  0.0  5476 nginx: worker process
  79603 svc_ngi+  0.0  0.0  5540 nginx: worker process
  79604 svc_ngi+  0.0  0.0  5508 nginx: worker process
```
✅ Khi không tải: CPU 0%, master ~2,3 MB, mỗi worker 5,5–6,4 MB RSS (cột `svc_ngi+` là `svc_nginx` bị cắt tên)

---

## Mục 3 – C8: mã HTTP và đo tải

### Ảnh 15 – Mã trả về
```bash
curl -I http://truong.test/
curl -I http://truong.test/tai-lieu/thong-bao-mau.txt
curl -I http://truong.test/tai-lieu/khong-co.pdf
curl -I http://truong.test/.git/config
```
**Kết quả:**
```
HTTP/1.1 200 OK
Server: nginx
Date: Fri, 06 Nov 2026 13:20:55 GMT
Content-Type: text/html
Content-Length: 1824

HTTP/1.1 200 OK
Server: nginx
Date: Fri, 06 Nov 2026 13:20:55 GMT
Content-Type: text/plain
Content-Length: 269

HTTP/1.1 404 Not Found
Server: nginx
Content-Type: text/html
Content-Length: 146

HTTP/1.1 403 Forbidden
Server: nginx
Content-Type: text/html
Content-Length: 146
```
✅ 200 · 200 · 404 · 403 · header `Server: nginx` không lộ phiên bản (`server_tokens off`)

### Ảnh 16 – 200 yêu cầu liên tiếp
```bash
for i in $(seq 1 200); do curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/; done | sort | uniq -c
```
**Kết quả:**
```
    200 200
```
✅ 200 lần đều trả mã 200 (100% thành công)

### Ảnh 17 – Benchmark (mở thêm 1 terminal chạy `top -u svc_nginx` rồi chụp cả hai)
```bash
ab -n 1000 -c 20 http://truong.test/
```
```bash
top -u svc_nginx
```
**Kết quả tóm tắt:**
```
Complete requests:      1000
Failed requests:        0
Requests per second:    35522.72 [#/sec] (mean)
Time per request:       0.563 [ms] (mean)
99% requests served within 2 ms
```
✅ 0 lỗi · 35.522 req/s · 0,563 ms là *Time per request (mean)* (= 20 / 35.522 s) · đo qua `127.0.0.1` nên không tính độ trễ mạng

### Ảnh 18 – Log truy cập
```bash
sudo tail -n 20 /var/log/nginx/school.access.log
sudo awk -F'"' '{split($3,a," "); print a[1]}' /var/log/nginx/school.access.log | sort | uniq -c
```
**Kết quả (thống kê mã trả về):**
```
   1252 200
     17 304
      1 403
      1 404
```
✅ Log ghi đủ các mã đã thử: 200 (bình thường), 304 (trình duyệt dùng bản lưu đệm), 403 (`/.git/config`), 404 (`khong-co.pdf`)

---

## Mục 4 – KT2: hai lỗi "không vào được web"

### Lỗi 1 – DNS sai
```bash
sudo cp /etc/hosts /etc/hosts.bak
sudo sed -i 's/^127.0.0.1\s\+truong.test/10.255.255.1 truong.test/' /etc/hosts
getent hosts truong.test
ping -c 2 truong.test
curl -m 5 -v http://truong.test/
```
Chụp thêm trình duyệt.

Khôi phục:
```bash
sudo cp /etc/hosts.bak /etc/hosts
getent hosts truong.test
```
**Kết quả ghi nhận:** `/etc/hosts` trỏ nhầm sang `10.255.255.1` → trình duyệt báo **`ERR_CONNECTION_TIMED_OUT`** (gửi gói tin tới IP không ai trả lời nên chờ mãi). Khôi phục bằng `/etc/hosts.bak` thì truy cập lại được.

### Lỗi 2 – Dừng dịch vụ
```bash
sudo systemctl stop nginx
getent hosts truong.test
ping -c 2 truong.test
curl -v http://truong.test/
sudo ss -ltnp 'sport = :80'
systemctl status nginx | cat
```
Chụp thêm trình duyệt.

Khôi phục:
```bash
sudo systemctl start nginx
systemctl status nginx | cat
```
**Kết quả ghi nhận:** `systemctl stop nginx` → trình duyệt báo **`ERR_CONNECTION_REFUSED`** (tên miền vẫn đúng IP, máy vẫn trả lời nhưng không còn tiến trình nghe cổng 80). `systemctl start nginx` thì truy cập lại được.

✅ Hai lỗi có bằng chứng khác nhau: **timeout** (sai DNS) ↔ **refused** (dịch vụ dừng)
> ⬜ Nên chèn thêm ảnh terminal `getent` / `curl -v` / `ss` của từng tình huống (tài liệu tổng hợp hiện chỉ ghi kết quả trình duyệt).

---

## Mục 5 – KT3: sao lưu và khôi phục

```bash
sudo rsync -a --delete /var/www/school/ /var/backups/school-demo/
sudo ls -l /var/backups/school-demo/ | head

sudo rm /var/www/school/index.html
curl -I http://truong.test/            # chụp: lỗi 403/404

sudo rsync -a --delete /var/backups/school-demo/ /var/www/school/
curl -I http://truong.test/            # chụp: 200 OK trở lại
```
**Kết quả ghi nhận:** sao lưu bằng `rsync -a --delete` vào `/var/backups/school-demo/`. Xoá thử `index.html` → lỗi 403/404; `rsync` ngược từ bản sao → trở lại `200 OK`.

✅ Khôi phục thành công

---

# PHẦN B – NÂNG CAO (ADVANCE)

> Theo `HUONG_DAN_SV2_ADVANCE.md`. Dịch vụ mới: `nginx-school.service`, cấu hình `/etc/nginx-school/nginx.conf`. Phần "Lệnh chụp" là lệnh để chụp lại minh chứng; phần "Kết quả ghi nhận" là kết quả đã đạt theo tài liệu tổng hợp. Đã làm Cấp 1–7 và Bonus so sánh Apache; **không làm Cấp 8** (backend + PostgreSQL trên máy đơn).

## B1 – Lỗi trong tài liệu gốc đã phát hiện và khắc phục

| # | Chỗ | Lỗi gốc | Cách khắc phục |
|---|---|---|---|
| 1 | Cấp 1 – `school-deploy.sh` | Xếp bản theo mtime (`ls -dt`); do `rsync` chép mtime thư mục nguồn nên rollback quay về chính bản đang chạy | Xếp theo tên thư mục (= thời điểm deploy); rollback chọn bản ngay trước bản đang chạy |
| 2 | Cấp 1 – hàm `cur()` | Chưa có `current` vẫn trả về đường dẫn | Chỉ `readlink` khi `current` là symlink thật |
| 3 | Cấp 2, 3, 5 | Ghi chú `# ...` cùng dòng cấu hình khiến systemd & sysctl đọc sai giá trị | Tách ghi chú ra dòng riêng |
| 4 | Cấp 2 – `sudo -u svc_nginx nginx -t` | `nginx -t` thử mở socket cổng 80 → không có capability nên `Permission denied` | Kiểm tra cú pháp bằng `systemctl reload nginx-school` |
| 5 | Bonus – Apache | `apt install apache2` tự khởi động, tranh cổng 80 | Chặn auto-start bằng `policy-rc.d` trong quá trình cài |
| 6 | Cấp 4 – AppArmor | Profile gắn với binary `/usr/sbin/nginx` chặn cả instance Nginx gốc đọc `/etc/nginx/` | Gỡ profile trước khi khôi phục Nginx gốc |

---

## B2 – Cấp 1: Triển khai chuyên nghiệp (Zero-Downtime & Tamper Detection)

**Lệnh chụp:**
```bash
sudo -l -U deploy                                            # chỉ liệt kê ĐÚNG 1 lệnh được phép
sudo -u deploy sudo -n systemctl stop nginx-school           # ❌ bị từ chối
readlink -f /var/www/school/current                          # đang chạy bản nào
sudo school-deploy.sh verify                                 # ✅ nguyên vẹn

# Sửa lén 1 file → verify phải phát hiện
sudo sh -c 'echo "<!-- hacked -->" >> /var/www/school/current/index.html'
sudo school-deploy.sh verify                                 # ❌ CÓ FILE BỊ SỬA
sudo school-deploy.sh rollback && sudo school-deploy.sh verify   # quay về bản sạch → ✅

# Terminal 2: tải liên tục, KHÔNG được có mã nào khác 200
while true; do curl -s -o /dev/null -w '%{http_code} ' http://truong.test/; sleep 0.05; done
# Terminal 1: health-check tự rollback
sudo SCHOOL_URL=http://truong.test/tai-lieu/khong-co.pdf school-deploy.sh deploy /home/deploy/dist
```

**Kết quả ghi nhận:**
- **Phân tách đặc quyền:** tài khoản `deploy` chỉ có đúng một quyền chạy script qua sudoers (`/etc/sudoers.d/school-deploy` với `NOPASSWD: /usr/local/sbin/school-deploy.sh`). Thử chạy lệnh hệ thống khác bị từ chối ngay lập tức.
- **Tự động rollback khi health-check thất bại:** trong lúc tải liên tục bằng vòng lặp `curl` (**557 lượt**), triển khai bản lỗi (`khong-co.pdf`) → hệ thống phát hiện mã 404 và tự rollback về bản cũ, **557/557 yêu cầu đều trả 200**, không gián đoạn.
- **Phát hiện sửa lén (integrity check):** đối chiếu checksum SHA-256 với `manifests/*.sha256`. Chèn thử `<!-- hacked -->` vào `index.html` → `verify` phát hiện sai lệch và rollback về phiên bản nguyên vẹn trước đó.

---

## B3 – Cấp 2: Nginx chạy 100% không root

**Lệnh chụp:**
```bash
ps -C nginx -o pid,ppid,euser:20,cmd                         # TẤT CẢ là svc_nginx, kể cả master
sudo ss -ltnp 'sport = :80'
PID=$(systemctl show -p MainPID --value nginx-school)
grep -E '^Cap(Prm|Eff|Amb|Bnd)' /proc/$PID/status
capsh --decode=0000000000000400                              # → cap_net_bind_service
grep NoNewPrivs /proc/$PID/status                            # NoNewPrivs: 1

# Đối chứng: không có capability thì không mở được cổng 80
sudo systemctl stop nginx-school
sudo setpriv --reuid=svc_nginx --regid=svc_nginx --clear-groups \
     /usr/sbin/nginx -g 'daemon off;' -c /etc/nginx-school/nginx.conf 2>&1 | grep -i bind
sudo systemctl start nginx-school

sudo su - svc_nginx                                          # → "This account is currently not available."
```

**Kết quả ghi nhận:**
- Toàn bộ Nginx chạy dưới user dịch vụ `svc_nginx` thông qua unit `nginx-school.service`.
- Cấp quyền mở cổng đặc quyền 80 bằng Linux capability: `AmbientCapabilities=CAP_NET_BIND_SERVICE`, `CapabilityBoundingSet=CAP_NET_BIND_SERVICE`, `NoNewPrivileges=yes`.
- Cả **master lẫn worker** đều thuộc `svc_nginx`. Tước capability thì Nginx khởi động báo ngay `bind() to 0.0.0.0:80 failed (13: Permission denied)`.

---

## B4 – Cấp 3: Sandbox systemd & giới hạn cgroup

**Lệnh chụp:**
```bash
systemd-analyze security nginx-school.service | tail -n 1    # chụp TRƯỚC và SAU khi thêm 10-sandbox.conf
PID=$(systemctl show -p MainPID --value nginx-school)
grep -E 'NoNewPrivs|Seccomp' /proc/$PID/status               # Seccomp: 2 = đang lọc syscall
systemctl show nginx-school -p MemoryMax -p CPUQuotaPerSecUSec -p TasksMax
cat /sys/fs/cgroup/system.slice/nginx-school.service/memory.max
sudo nsenter -t $PID -m ls /home                             # dịch vụ không thấy /home
sudo systemd-run --wait --pipe -p User=svc_nginx -p ProtectSystem=strict touch /usr/local/probe 2>&1 | tail -n 1
```

**Kết quả ghi nhận:**
- Drop-in `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf` (toàn văn ở B9.2).
- Hệ thống tệp: `ProtectSystem=strict` (toàn bộ filesystem chỉ đọc, trừ thư mục runtime/log), `ProtectHome=yes` (ẩn toàn bộ `/home`), `PrivateTmp=yes`.
- Seccomp & bảo mật: `SystemCallFilter=@system-service`, `MemoryDenyWriteExecute=yes`.
- Điểm phơi nhiễm `systemd-analyze security nginx-school.service`: **6.7 MEDIUM → 1.7 OK**.
- cgroup: `MemoryMax=300M`, `CPUQuota=80%`, `TasksMax=200`.

---

## B5 – Cấp 4: AppArmor MAC (Mandatory Access Control)

**Lệnh chụp:**
```bash
sudo aa-status | grep -A2 nginx                              # profile ở enforce mode

# Thí nghiệm DAC vs MAC
echo "bí-mật-giả-lập" | sudo tee /etc/school-probe.txt && sudo chmod 644 /etc/school-probe.txt
# (thêm  location = /probe { alias /etc/school-probe.txt; }  vào /etc/nginx-school/nginx.conf, reload)
sudo aa-complain /usr/sbin/nginx && sudo systemctl restart nginx-school
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/probe       # 200
sudo aa-enforce /usr/sbin/nginx && sudo systemctl restart nginx-school
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/probe       # 403
sudo journalctl -k | grep -i 'apparmor="DENIED"' | tail -n 2
# Dọn dẹp: xoá dòng location = /probe, sudo rm /etc/school-probe.txt, reload
```

**Kết quả ghi nhận:**
- Profile `/etc/apparmor.d/usr.sbin.nginx` (toàn văn ở B9.3) giới hạn chặt tài nguyên Nginx được phép truy cập.
- Thí nghiệm DAC vs MAC: tạo `/etc/school-probe.txt` quyền 644 (DAC cho phép đọc) và `location = /probe { alias /etc/school-probe.txt; }`.

| Chế độ | `curl .../probe` | Giải thích |
|---|---|---|
| complain | **200** (lộ nội dung) | DAC cho phép, AppArmor chỉ ghi nhận |
| enforce | **403** | MAC chặn; kernel ghi `apparmor="DENIED" operation="open" name="/etc/school-probe.txt"` |

---

## B6 – Cấp 5: Tinh chỉnh kernel & file mount

**Lệnh chụp:**
```bash
for p in $(pgrep -f 'nginx: worker'); do grep 'Max open files' /proc/$p/limits; done
PID=$(systemctl show -p MainPID --value nginx-school); grep 'Max open files' /proc/$PID/limits
sudo sysctl --system | grep -E 'somaxconn|tcp_max_syn'
ss -ltn 'sport = :80'                                        # cột Send-Q = backlog đang áp dụng
findmnt /var/www/school                                      # OPTIONS: ro,nosuid,nodev,noexec
sudo touch /var/www/school/test                              # ❌ Read-only file system – kể cả root
curl -I http://truong.test/                                  # vẫn 200

# Reload vs restart
ps -C nginx -o pid,ppid,euser:20,lstart,cmd
while true; do curl -s -o /dev/null -w '%{http_code} ' http://truong.test/; sleep 0.05; done &
sudo systemctl reload nginx-school
ps -C nginx -o pid,ppid,euser:20,lstart,cmd                  # PID master GIỮ NGUYÊN, worker mới
kill %1
```

**Kết quả ghi nhận:**
- **Giới hạn file descriptor** xếp tầng: `worker_connections` (4096) ≤ `worker_rlimit_nofile` (8192) ≤ `LimitNOFILE` (16384).
- **Kernel backlog:** nâng `somaxconn` lên 4096 và `tcp_max_syn_backlog` lên 4096 qua `/etc/sysctl.d/90-school.conf`. Chứng minh hàng đợi thực tế bị kernel áp trần: `Send-Q = min(backlog của Nginx, somaxconn)`.
- **Read-only bind mount:** `/var/www/school` mount với `ro,nosuid,nodev,noexec`; kể cả root cũng không ghi/sửa trực tiếp được. `school-deploy.sh` tự mở khoá/khoá lại khi phát hành bản mới.
- **Reload vs restart:** `systemctl reload` giữ nguyên PID master và không rớt request nào; `restart` đổi PID và làm gián đoạn request.

---

## B7 – Cấp 6 & 7: Kiểm thử tự động & phòng lab lỗi

**Lệnh chụp:**
```bash
sudo bash verify-sv2.sh
```

**Kết quả ghi nhận:** `verify-sv2.sh` đạt **31/31 PASS**, điểm bảo mật **1.7 OK**.

**Các lab lỗi đã làm (gây lỗi → triệu chứng → chẩn đoán → sửa):**

| # | Gây lỗi | Triệu chứng thực tế | Ghi chú |
|---|---|---|---|
| 1 | Mất quyền thực thi thư mục (`chmod 700 /var/www/school`) | **500** thay vì 403 như hướng dẫn dự đoán | `try_files` chuyển nội bộ sang `/index.html`, cũng không đọc được → vòng lặp chuyển hướng nội bộ → 500. Sửa: `chmod 750` |
| 2 | Chép đè thủ công (sai quyền, thiếu hash) | 500/404 | `verify` phát hiện bản không có hash. Sửa: dùng `school-deploy.sh` |
| 3 | Xung đột instance (bật lại `nginx` gốc) | Nginx gốc không khởi động | AppArmor chặn đọc cấu hình `/etc/nginx/` |
| 4 | Mất capability mở cổng | `bind() ... (13: Permission denied)` | Trả lại `AmbientCapabilities` |
| 5 | Ghi log ra ngoài vùng sandbox | `(30: Read-only file system)` | Khác `13` (thiếu quyền): `30` là bị sandbox/mount chặn. Sửa: đưa log về `LogsDirectory` |

---

## B8 – So sánh Nginx đã hardening và Apache mặc định

**Lệnh chụp:**
```bash
systemd-analyze security apache2.service | tail -n 1
systemd-analyze security nginx-school.service | tail -n 1
ps -C apache2 -o pid,ppid,euser:20,cmd
ps -C nginx -o pid,ppid,euser:20,cmd
sudo aa-status | grep -E 'nginx|apache'
wc -l /etc/apache2/apache2.conf /etc/apache2/sites-available/000-default.conf /etc/nginx-school/nginx.conf
```

**Kết quả ghi nhận:**

| Tiêu chí | Nginx (`nginx-school`, đã hardening) | Apache 2.4.66 (mặc định) |
|---|---|---|
| Master process | `svc_nginx` (không root) | `root` |
| Worker process | `svc_nginx` | `www-data` |
| Capability của master | 1 (`cap_net_bind_service`) | 35 |
| AppArmor | enforce | unconfined |
| Exposure level (`systemd-analyze`) | **1.7 OK** | **5.7 MEDIUM** |
| Cấu hình | 1 file duy nhất (~50 dòng thực) | Phân mảnh nhiều thư mục/file |
| Khả năng chịu lỗi cấu hình | Cách ly bằng sandbox | Quyền hạn rộng, rủi ro cao hơn |

---

## B9 – Phụ lục cấu hình hoàn chỉnh

### B9.1 Service file `/etc/systemd/system/nginx-school.service`
```ini
[Unit]
Description=Nginx - School Portal (chạy KHÔNG root)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=svc_nginx
Group=svc_nginx
RuntimeDirectory=nginx-school
StateDirectory=nginx-school
LogsDirectory=nginx-school

ExecStartPre=/usr/sbin/nginx -t -q -c /etc/nginx-school/nginx.conf
ExecStart=/usr/sbin/nginx -g "daemon off;" -c /etc/nginx-school/nginx.conf
ExecReload=/usr/sbin/nginx -t -q -c /etc/nginx-school/nginx.conf
ExecReload=/bin/kill -HUP $MAINPID
KillSignal=SIGQUIT
KillMode=mixed
TimeoutStopSec=15
Restart=on-failure
RestartSec=2s
LimitNOFILE=16384

AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
NoNewPrivileges=yes
UMask=0027

[Install]
WantedBy=multi-user.target
```

### B9.2 Sandbox drop-in `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf`
```ini
[Service]
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
InaccessiblePaths=-/root -/boot -/mnt -/media -/srv -/opt
ProtectProc=invisible
ProcSubset=pid

ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectKernelLogs=yes
ProtectControlGroups=yes
ProtectClock=yes
ProtectHostname=yes

RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=yes
RestrictRealtime=yes
RestrictSUIDSGID=yes
LockPersonality=yes
MemoryDenyWriteExecute=yes
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

MemoryMax=300M
CPUQuota=80%
TasksMax=200
```

### B9.3 AppArmor profile `/etc/apparmor.d/usr.sbin.nginx`
```
abi <abi/4.0>,
#include <tunables/global>

/usr/sbin/nginx flags=(attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>

  capability net_bind_service,

  network inet stream,
  network inet6 stream,
  network unix stream,

  /usr/sbin/nginx                  mr,
  /etc/nginx-school/**             r,
  /etc/nginx/mime.types            r,
  /var/www/school/**               r,
  /var/log/nginx-school/**         rw,
  /var/lib/nginx-school/**         rwk,
  /run/nginx-school/**             rwk,
  /proc/sys/net/core/somaxconn     r,
  /sys/devices/system/cpu/         r,
  /sys/devices/system/cpu/**       r,
}
```

### B9.4 Sysctl kernel `/etc/sysctl.d/90-school.conf`
```
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
```

---

## Danh sách đối chiếu cuối cùng

**Phần A – Cơ bản**
- [x] `sudo nginx -t` OK (ảnh 8)
- [ ] Trình duyệt mở `http://truong.test` và tải tài liệu (ảnh 10) – **chưa có**, nên chụp từ máy khách
- [x] `/etc/hosts` + `getent hosts truong.test` + ping (ảnh 5)
- [x] `ufw status` (ảnh 6)
- [x] `ps` (root / svc_nginx) + `systemctl status nginx` (ảnh 2, 9, 11)
- [x] `ls -l` + `namei -l` + thử ghi bằng `svc_nginx` bị từ chối (ảnh 3, 4)
- [x] `ss -ltnp` (PID giữ cổng 80) (ảnh 12)
- [x] Mã 200/200/404/403 (ảnh 15), 200 yêu cầu liên tiếp (ảnh 16), `ab` (ảnh 17), log (ảnh 18)
- [x] KT2: timeout (sai DNS) ↔ refused (dừng dịch vụ) – [ ] nên thêm ảnh terminal
- [x] KT3: xoá → lỗi, `rsync` phục hồi → 200

**Phần B – Nâng cao**
- [x] Cấp 1: sudoers 1 lệnh; `verify` ✅ → ❌ (sửa lén) → ✅; tự rollback; 557/557 mã 200
- [x] Cấp 2: master và worker đều `svc_nginx`; đối chứng `bind() ... (13: Permission denied)`
- [x] Cấp 3: điểm `systemd-analyze security` 6.7 → 1.7; cgroup `MemoryMax/CPUQuota/TasksMax`
- [x] Cấp 4: AppArmor enforce; `/probe` 200 ↔ 403; dòng `apparmor="DENIED"`
- [x] Cấp 5: file descriptor, `somaxconn`, mount `ro,nosuid,nodev,noexec`, reload giữ PID master
- [x] Cấp 6: `verify-sv2.sh` 31/31 PASS
- [x] Cấp 7: 5 lab lỗi
- [x] Bonus: so sánh Nginx ↔ Apache
- [ ] Cấp 8 (backend + PostgreSQL): không làm
