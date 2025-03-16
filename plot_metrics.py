import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime
import numpy as np

# Create graphs directory if it doesn't exist
if not os.path.exists('graphs-images'):
    os.makedirs('graphs-images')

# Read the CSV file
df = pd.read_csv('metrics.csv')

# Convert time strings to numeric values (removing 'ms' suffix)
for col in ['JWT Validation Time (ms)', 'DB Query Time (ms)', 'Blockchain Validation Time (ms)', 'Total Processing Time (ms)']:
    df[col] = df[col].str.replace('ms', '').astype(float)

# Set seaborn theme - using the correct modern syntax
sns.set_theme(style="darkgrid")

# 1. Average Processing Time by Operation Type
plt.figure(figsize=(10, 6))
avg_times = df.groupby('Operation Type')['Total Processing Time (ms)'].mean().sort_values(ascending=False)
sns.barplot(x=avg_times.index, y=avg_times.values, palette="viridis")
plt.title('Average Processing Time by Operation Type', fontsize=15)
plt.xlabel('Operation Type', fontsize=12)
plt.ylabel('Average Processing Time (ms)', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('graphs/avg_processing_time.png', dpi=300)
plt.close()

# 2. Time Distribution by Operation Type
plt.figure(figsize=(12, 6))
sns.boxplot(x='Operation Type', y='Total Processing Time (ms)', data=df, palette="viridis")
plt.title('Processing Time Distribution by Operation Type', fontsize=15)
plt.xlabel('Operation Type', fontsize=12)
plt.ylabel('Processing Time (ms)', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('graphs/time_distribution.png', dpi=300)
plt.close()

# 3. Gas Usage by Operation Type
plt.figure(figsize=(10, 6))
gas_usage = df.groupby('Operation Type')['Gas Used'].mean().sort_values(ascending=False)
sns.barplot(x=gas_usage.index, y=gas_usage.values, palette="viridis")
plt.title('Average Gas Usage by Operation Type', fontsize=15)
plt.xlabel('Operation Type', fontsize=12)
plt.ylabel('Average Gas Used', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('graphs/gas_usage.png', dpi=300)
plt.close()

# 4. Component-wise Time Breakdown
plt.figure(figsize=(12, 6))
components = ['JWT Validation Time (ms)', 'DB Query Time (ms)', 'Blockchain Validation Time (ms)']
component_times = df[components].mean().sort_values(ascending=False)
sns.barplot(x=component_times.index, y=component_times.values, palette="viridis")
plt.title('Average Component-wise Time Breakdown', fontsize=15)
plt.xlabel('Component', fontsize=12)
plt.ylabel('Average Time (ms)', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('graphs/component_breakdown.png', dpi=300)
plt.close()

# 5. Time Series of Total Processing Time
plt.figure(figsize=(15, 6))
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
plt.plot(df['Timestamp'], df['Total Processing Time (ms)'], marker='o', linestyle='-', color='#1f77b4')
plt.title('Total Processing Time Over Time', fontsize=15)
plt.xlabel('Timestamp', fontsize=12)
plt.ylabel('Total Processing Time (ms)', fontsize=12)
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('graphs/time_series.png', dpi=300)
plt.close()

# 6. Heatmap of Operation Types vs Time Components
plt.figure(figsize=(12, 8))
time_components = ['JWT Validation Time (ms)', 'DB Query Time (ms)', 'Blockchain Validation Time (ms)']
heatmap_data = df.groupby('Operation Type')[time_components].mean()
sns.heatmap(heatmap_data, annot=True, fmt='.1f', cmap='viridis')
plt.title('Heatmap of Operation Types vs Time Components', fontsize=15)
plt.tight_layout()
plt.savefig('graphs/operation_heatmap.png', dpi=300)
plt.close()

# 7. Pie Chart of Gas Usage Distribution by Operation Type
plt.figure(figsize=(10, 8))
gas_by_op = df.groupby('Operation Type')['Gas Used'].sum()
plt.pie(gas_by_op, labels=gas_by_op.index, autopct='%1.1f%%', startangle=90, 
        colors=sns.color_palette('viridis', len(gas_by_op)))
plt.title('Gas Usage Distribution by Operation Type', fontsize=15)
plt.axis('equal')
plt.tight_layout()
plt.savefig('graphs/gas_usage_pie.png', dpi=300)
plt.close()

# 8. Correlation Heatmap between different metrics
plt.figure(figsize=(12, 10))
correlation_columns = ['JWT Validation Time (ms)', 'DB Query Time (ms)', 
                       'Blockchain Validation Time (ms)', 'Gas Used', 'Total Processing Time (ms)']
correlation_matrix = df[correlation_columns].corr()
mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
sns.heatmap(correlation_matrix, mask=mask, annot=True, fmt='.2f', cmap='coolwarm', 
            vmin=-1, vmax=1, center=0, square=True, linewidths=.5)
plt.title('Correlation Between Different Metrics', fontsize=15)
plt.tight_layout()
plt.savefig('graphs/correlation_heatmap.png', dpi=300)
plt.close()

# 9. Stacked Area Chart of Time Components
plt.figure(figsize=(15, 8))
# Sort by timestamp to ensure chronological order
df = df.sort_values('Timestamp')
# Create a stacked area chart
plt.stackplot(df['Timestamp'], 
              df['JWT Validation Time (ms)'],
              df['DB Query Time (ms)'],
              df['Blockchain Validation Time (ms)'],
              labels=['JWT Validation', 'DB Query', 'Blockchain Validation'],
              alpha=0.8,
              colors=sns.color_palette("viridis", 3))

plt.title('Stacked Time Components Over Time', fontsize=15)
plt.xlabel('Timestamp', fontsize=12)
plt.ylabel('Time (ms)', fontsize=12)
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.legend(fontsize=12, loc='upper left')
plt.tight_layout()
plt.savefig('graphs/stacked_time_components.png', dpi=300)
plt.close()

# 10. Multiple Subplots for Each Time Component
fig, axes = plt.subplots(4, 1, figsize=(15, 16), sharex=True)
df = df.sort_values('Timestamp')

# Plot each component in its own subplot
axes[0].plot(df['Timestamp'], df['JWT Validation Time (ms)'], color='#440154', marker='.', linestyle='-')
axes[0].set_title('JWT Validation Time', fontsize=14)
axes[0].set_ylabel('Time (ms)', fontsize=12)
axes[0].grid(True, alpha=0.3)
axes[0].fill_between(df['Timestamp'], df['JWT Validation Time (ms)'], alpha=0.3, color='#440154')

axes[1].plot(df['Timestamp'], df['DB Query Time (ms)'], color='#21918c', marker='.', linestyle='-')
axes[1].set_title('DB Query Time', fontsize=14)
axes[1].set_ylabel('Time (ms)', fontsize=12)
axes[1].grid(True, alpha=0.3)
axes[1].fill_between(df['Timestamp'], df['DB Query Time (ms)'], alpha=0.3, color='#21918c')

axes[2].plot(df['Timestamp'], df['Blockchain Validation Time (ms)'], color='#fde725', marker='.', linestyle='-')
axes[2].set_title('Blockchain Validation Time', fontsize=14)
axes[2].set_ylabel('Time (ms)', fontsize=12)
axes[2].grid(True, alpha=0.3)
axes[2].fill_between(df['Timestamp'], df['Blockchain Validation Time (ms)'], alpha=0.3, color='#fde725')

axes[3].plot(df['Timestamp'], df['Total Processing Time (ms)'], color='#365486', marker='.', linestyle='-')
axes[3].set_title('Total Processing Time', fontsize=14)
axes[3].set_ylabel('Time (ms)', fontsize=12)
axes[3].set_xlabel('Timestamp', fontsize=12)
axes[3].grid(True, alpha=0.3)
axes[3].fill_between(df['Timestamp'], df['Total Processing Time (ms)'], alpha=0.3, color='#365486')

plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('graphs/separate_time_components.png', dpi=300)
plt.close()

# 11. Percentage Stacked Area Chart
plt.figure(figsize=(15, 8))
# Calculate the percentage contribution of each component
components_df = df[['Timestamp', 'JWT Validation Time (ms)', 'DB Query Time (ms)', 'Blockchain Validation Time (ms)']]
components_df_pct = components_df.set_index('Timestamp')
components_df_pct = components_df_pct.div(components_df_pct.sum(axis=1), axis=0) * 100

# Create a percentage stacked area chart
plt.stackplot(components_df_pct.index, 
              components_df_pct['JWT Validation Time (ms)'],
              components_df_pct['DB Query Time (ms)'],
              components_df_pct['Blockchain Validation Time (ms)'],
              labels=['JWT Validation', 'DB Query', 'Blockchain Validation'],
              alpha=0.8,
              colors=sns.color_palette("viridis", 3))

plt.title('Percentage Contribution of Each Time Component', fontsize=15)
plt.xlabel('Timestamp', fontsize=12)
plt.ylabel('Percentage (%)', fontsize=12)
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.legend(fontsize=12, loc='upper left')
plt.tight_layout()
plt.savefig('graphs/percentage_time_components.png', dpi=300)
plt.close()

# 12. Histogram of Time Components
plt.figure(figsize=(15, 10))
components = ['JWT Validation Time (ms)', 'DB Query Time (ms)', 'Blockchain Validation Time (ms)']

# Create subplots for histograms
fig, axes = plt.subplots(3, 1, figsize=(12, 12), sharex=False)
colors = sns.color_palette("viridis", 3)

# Plot histograms for each component
sns.histplot(df['JWT Validation Time (ms)'], kde=True, ax=axes[0], color=colors[0])
axes[0].set_title('Distribution of JWT Validation Time', fontsize=14)
axes[0].set_xlabel('Time (ms)', fontsize=12)
axes[0].set_ylabel('Frequency', fontsize=12)

sns.histplot(df['DB Query Time (ms)'], kde=True, ax=axes[1], color=colors[1])
axes[1].set_title('Distribution of DB Query Time', fontsize=14)
axes[1].set_xlabel('Time (ms)', fontsize=12)
axes[1].set_ylabel('Frequency', fontsize=12)

sns.histplot(df['Blockchain Validation Time (ms)'], kde=True, ax=axes[2], color=colors[2])
axes[2].set_title('Distribution of Blockchain Validation Time', fontsize=14)
axes[2].set_xlabel('Time (ms)', fontsize=12)
axes[2].set_ylabel('Frequency', fontsize=12)

plt.tight_layout()
plt.savefig('graphs/time_components_histograms.png', dpi=300)
plt.close()

print("Graphs have been generated in the 'graphs-images' directory!") 