import requests
import json
import os
import datetime

# 链接列表文件
LINKS_FILE = "sources.txt" # 对应你的 sources.txt
# 聚合后的输出文件
OUTPUT_FILE = "merged.fwd" # 对应你的 merged.fwd

def get_fwd_urls_from_file(file_path):
    """从文件中读取 .fwd 链接列表，跳过空行和注释行"""
    urls = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    urls.append(line)
    except FileNotFoundError:
        print(f"Error: {file_path} not found. Please create it with your .fwd URLs.")
    return urls

def aggregate_fwd_widgets(urls, output_file_path):
    """
    抓取所有 .fwd 文件，提取 'widgets' 内容并聚合。
    """
    all_widgets = []
    
    for url in urls:
        print(f"Processing URL: {url}")
        try:
            response = requests.get(url, timeout=15) # 增加超时时间
            response.raise_for_status()  # 检查 HTTP 错误
            
            # 尝试解析为 JSON
            data = response.json()
            
            # 检查是否存在 'widgets' 键且为列表
            if 'widgets' in data and isinstance(data['widgets'], list):
                all_widgets.extend(data['widgets'])
                print(f"  Successfully extracted {len(data['widgets'])} widgets from {url}")
            else:
                print(f"  Warning: '{url}' does not contain a valid 'widgets' array. Skipping.")
                
        except requests.exceptions.RequestException as e:
            print(f"  Error fetching {url}: {e}")
        except json.JSONDecodeError:
            print(f"  Error: '{url}' content is not valid JSON. Skipping.")
        except Exception as e:
            print(f"  An unexpected error occurred for {url}: {e}")

    # 构建最终的聚合 JSON 结构
    final_output = {
        "title": "Forward Widgets 拼接合集",
        "description": f"自动拼接合并 - 最后更新: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "widgets": all_widgets
    }

    # 将聚合内容写入输出文件，使用 json.dump 保证格式正确
    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            json.dump(final_output, f, ensure_ascii=False, indent=2) # indent=2 用于美化输出
        print(f"\nSuccessfully aggregated {len(all_widgets)} widgets to {output_file_path}")
    except Exception as e:
        print(f"Error writing output file {output_file_path}: {e}")


if __name__ == "__main__":
    fwd_urls = get_fwd_urls_from_file(LINKS_FILE)
    if fwd_urls:
        aggregate_fwd_widgets(fwd_urls, OUTPUT_FILE)
    else:
        print("No URLs found in links.txt. Nothing to aggregate.")

